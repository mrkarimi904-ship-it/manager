import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { DbService } from 'src/db/db.service';
import { CameraServiceService } from 'src/camera_service/camera_service.service';
import { LprQueueService } from 'src/lpr_queue/lpr_queue.service';
import { StorageService } from 'src/storage/storage.service';
import { generalResponse } from 'src/app.consts';
import { toErrorResponse } from 'src/common/error.util';

type WorkerType = 'camera_service' | 'camera_recorder' | 'camera_playback' | 'lpr_service' | 'mismatch_service';

type AssignmentType = 'stream' | 'recorder' | 'lpr' | 'mismatch';

type WorkerAssignment = {
  id: string;
  assignmentType: AssignmentType;
  assignmentLabel: string;
  cameraId: string | null;
  cameraName: string | null;
  targetType: 'camera' | 'mismatch';
  targetId: string;
};

const CAMERA_NAME_SELECT = {
  id: true,
  url: true,
  camera_info: { where: { key: 'name' }, select: { value: true }, take: 1 },
} as const;

const WORKER_PROBE: Record<WorkerType, string> = {
  camera_service: '/camera_service',
  camera_recorder: '/camera_recorder/recorder',
  camera_playback: '/camera_playback',
  lpr_service: '/lpr_service',
  mismatch_service: '/lpr-mismatch/status',
};

const LPR_HEALTHY_STATUSES = ['RUNNING', 'PENDING', 'STARTING'];

type IncidentSeverity = 'critical' | 'error' | 'warning';

type Incident = {
  code: string;
  severity: IncidentSeverity;
  sourceType: string;
  sourceId: string;
  message: string;
  meta?: Record<string, string>;
};

@Injectable()
export class WorkersService implements OnModuleInit {
  private incidentsSnapshot: { updatedAt: string | null; incidents: Incident[] } = {
    updatedAt: null,
    incidents: [],
  };

  private incidentsRefreshing = false;

  constructor(
    private db: DbService,
    private readonly axios: HttpService,
    private cameraServiceService: CameraServiceService,
    private lprQueueService: LprQueueService,
    private storageService: StorageService,
  ) {}

  onModuleInit() {
    void this.refreshIncidents();
  }

  getIncidents(): generalResponse {
    return {
      status: true,
      data: {
        updatedAt: this.incidentsSnapshot.updatedAt,
        incidents: this.incidentsSnapshot.incidents,
      },
      error: null,
      msg: null,
    };
  }

  @Cron('0/30 * * * * *')
  async refreshIncidents() {
    if (this.incidentsRefreshing) return;
    this.incidentsRefreshing = true;
    try {
      this.incidentsSnapshot = {
        updatedAt: new Date().toISOString(),
        incidents: await this.buildIncidents(),
      };
    } catch (error) {
      console.error('Failed to refresh worker incidents:', error?.message || error);
    } finally {
      this.incidentsRefreshing = false;
    }
  }

  private async buildIncidents(): Promise<Incident[]> {
    const incidents: Incident[] = [];

    const [
      databaseOk,
      redisOk,
      minioHealth,
      cameraServices,
      cameraRecorders,
      cameraPlaybacks,
      lprServices,
      mismatchServices,
      badRecorders,
      badLprs,
      offlineDevices,
    ] = await Promise.all([
      this.db.checkHealth(),
      this.lprQueueService.checkRedisHealth(),
      this.storageService.checkHealth(),
      this.db.camera_service.findMany({ select: { id: true, url: true, port: true } }),
      this.db.camera_recorder.findMany({ select: { id: true, url: true, port: true } }),
      this.db.camera_playback.findMany({ select: { id: true, url: true, port: true } }),
      this.db.camera_lpr.findMany({ select: { id: true, url: true, port: true } }),
      this.db.mismatch_service.findMany({ select: { id: true, url: true, port: true } }),
      this.db.camera_recorder_camera.findMany({
        where: { isActive: true, status: { not: 'RUNNING' } },
        select: {
          id: true,
          title: true,
          status: true,
          camera_recorder: { select: { id: true, url: true, port: true }, take: 1 },
        },
      }),
      this.db.camera_lpr_camera.findMany({
        where: { isActive: true, status: { notIn: LPR_HEALTHY_STATUSES } },
        select: {
          id: true,
          title: true,
          status: true,
          camera_lpr: { select: { id: true, url: true, port: true }, take: 1 },
        },
      }),
      this.db.device.findMany({
        where: { deleted: false, status: 'offline' },
        select: { id: true, name: true, url: true },
      }),
    ]);

    if (!databaseOk) {
      incidents.push({
        code: 'infra_down',
        severity: 'critical',
        sourceType: 'postgres',
        sourceId: 'main',
        message: 'PostgreSQL is unreachable',
      });
    }

    if (!redisOk) {
      incidents.push({
        code: 'infra_down',
        severity: 'critical',
        sourceType: 'redis',
        sourceId: 'main',
        message: 'Redis is unreachable',
      });
    }

    if (minioHealth.enabled && !minioHealth.ok) {
      incidents.push({
        code: 'infra_down',
        severity: 'error',
        sourceType: 'minio',
        sourceId: 'main',
        message: minioHealth.message || 'MinIO is unreachable',
        meta: minioHealth.bucket ? { bucket: minioHealth.bucket } : undefined,
      });
    }

    const workerRows: Array<{ type: WorkerType; row: { id: string; url: string; port: string } }> = [
      ...cameraServices.map((row) => ({ type: 'camera_service' as const, row })),
      ...cameraRecorders.map((row) => ({ type: 'camera_recorder' as const, row })),
      ...cameraPlaybacks.map((row) => ({ type: 'camera_playback' as const, row })),
      ...lprServices.map((row) => ({ type: 'lpr_service' as const, row })),
      ...mismatchServices.map((row) => ({ type: 'mismatch_service' as const, row })),
    ];

    const workerResults = await Promise.all(
      workerRows.map(async ({ type, row }) => ({
        type,
        row,
        online: await this.probe(row.url, row.port, WORKER_PROBE[type]),
      })),
    );

    for (const { type, row, online } of workerResults) {
      if (!online) {
        incidents.push({
          code: 'worker_offline',
          severity: 'error',
          sourceType: type,
          sourceId: row.id,
          message: `${type} offline: ${row.url}:${row.port}`,
          meta: { url: row.url, port: row.port },
        });
      }
    }

    for (const recorder of badRecorders) {
      const host = recorder.camera_recorder[0];
      incidents.push({
        code: 'recorder_not_running',
        severity: 'warning',
        sourceType: 'camera_recorder_camera',
        sourceId: recorder.id,
        message: `Recorder "${recorder.title}" not running (${recorder.status})`,
        meta: host ? { workerId: host.id, url: host.url, port: host.port } : undefined,
      });
    }

    for (const lpr of badLprs) {
      const host = lpr.camera_lpr[0];
      incidents.push({
        code: 'lpr_not_running',
        severity: 'warning',
        sourceType: 'camera_lpr_camera',
        sourceId: lpr.id,
        message: `LPR "${lpr.title}" not running (${lpr.status})`,
        meta: host ? { workerId: host.id, url: host.url, port: host.port } : undefined,
      });
    }

    for (const device of offlineDevices) {
      incidents.push({
        code: 'device_offline',
        severity: 'warning',
        sourceType: 'device',
        sourceId: device.id,
        message: `Device offline: ${device.name || device.url}`,
        meta: { url: device.url },
      });
    }

    return incidents;
  }

  private async probe(url: string, port: string, path: string): Promise<boolean> {
    try {
      await this.axios.axiosRef.get(`http://${url}:${port}${path}`, { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  private cameraDisplayName(camera: { id: string; url: string; camera_info: { value: string }[] }): string {
    return camera.camera_info[0]?.value || camera.url || camera.id;
  }

  private streamTypeLabel(type: string): string {
    return type === 'live' ? 'LOW' : 'HIGH';
  }

  private async resolveAssignments(type: WorkerType, id: string, url?: string): Promise<WorkerAssignment[]> {
    switch (type) {
      case 'camera_service': {
        const rows = await this.db.camera_service_camera.findMany({
          where: { camera_service: { some: { id } } },
          select: {
            id: true,
            type: true,
            camera: { select: CAMERA_NAME_SELECT },
          },
        });
        return rows.flatMap((row) =>
          row.camera.map((camera) => ({
            id: row.id,
            assignmentType: 'stream' as const,
            assignmentLabel: this.streamTypeLabel(row.type),
            cameraId: camera.id,
            cameraName: this.cameraDisplayName(camera),
            targetType: 'camera' as const,
            targetId: camera.id,
          })),
        );
      }
      case 'camera_recorder': {
        const rows = await this.db.camera_recorder_camera.findMany({
          where: { camera_recorder: { some: { id } } },
          select: {
            id: true,
            title: true,
            camera: { select: CAMERA_NAME_SELECT },
          },
        });
        return rows.flatMap((row) =>
          row.camera.map((camera) => ({
            id: row.id,
            assignmentType: 'recorder' as const,
            assignmentLabel: row.title,
            cameraId: camera.id,
            cameraName: this.cameraDisplayName(camera),
            targetType: 'camera' as const,
            targetId: camera.id,
          })),
        );
      }
      case 'camera_playback': {
        if (!url) return [];
        const recorders = await this.db.camera_recorder.findMany({
          where: { url },
          select: { id: true },
        });
        if (!recorders.length) return [];
        const rows = await this.db.camera_recorder_camera.findMany({
          where: { camera_recorder: { some: { id: { in: recorders.map((recorder) => recorder.id) } } } },
          select: {
            id: true,
            title: true,
            camera: { select: CAMERA_NAME_SELECT },
          },
        });
        return rows.flatMap((row) =>
          row.camera.map((camera) => ({
            id: row.id,
            assignmentType: 'recorder' as const,
            assignmentLabel: row.title,
            cameraId: camera.id,
            cameraName: this.cameraDisplayName(camera),
            targetType: 'camera' as const,
            targetId: camera.id,
          })),
        );
      }
      case 'lpr_service': {
        const rows = await this.db.camera_lpr_camera.findMany({
          where: { camera_lpr: { some: { id } } },
          select: {
            id: true,
            title: true,
            camera: { select: CAMERA_NAME_SELECT },
          },
        });
        return rows.flatMap((row) =>
          row.camera.map((camera) => ({
            id: row.id,
            assignmentType: 'lpr' as const,
            assignmentLabel: row.title,
            cameraId: camera.id,
            cameraName: this.cameraDisplayName(camera),
            targetType: 'camera' as const,
            targetId: camera.id,
          })),
        );
      }
      case 'mismatch_service': {
        const mismatches = await this.db.mismatch.findMany({
          where: { mismatch_service: { some: { id } } },
          select: {
            id: true,
            title: true,
            camera1: { select: CAMERA_NAME_SELECT },
            camera2: { select: CAMERA_NAME_SELECT },
          },
        });
        return mismatches.map((mismatch) => ({
          id: mismatch.id,
          assignmentType: 'mismatch' as const,
          assignmentLabel: mismatch.title,
          cameraId: null,
          cameraName: `${this.cameraDisplayName(mismatch.camera1)} / ${this.cameraDisplayName(mismatch.camera2)}`,
          targetType: 'mismatch' as const,
          targetId: mismatch.id,
        }));
      }
      default:
        return [];
    }
  }

  async getAssignments(type: string, id: string): Promise<generalResponse> {
    try {
      if (!Object.prototype.hasOwnProperty.call(WORKER_PROBE, type)) {
        throw new HttpException({ status: false, data: null, error: 'Invalid worker type', msg: 'Invalid worker type' }, 406);
      }
      const workerType = type as WorkerType;
      const row = await this.getWorkerRow(workerType, id);
      if (!row) {
        throw new HttpException({ status: false, data: null, error: 'Worker not found', msg: 'Worker not found' }, 406);
      }

      const [assignments, online] = await Promise.all([
        this.resolveAssignments(workerType, id, row.url),
        this.probe(row.url, row.port, WORKER_PROBE[workerType]),
      ]);

      return {
        status: true,
        data: {
          worker: {
            id: row.id,
            type: workerType,
            url: row.url,
            port: row.port,
            online,
          },
          assignments,
        },
        error: null,
        msg: null,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(toErrorResponse(error, 'Failed to list worker assignments'), 406);
    }
  }

  private async assignmentCount(type: WorkerType, id: string, url?: string): Promise<number> {
    switch (type) {
      case 'camera_service':
        return this.db.camera_service_camera.count({ where: { camera_service: { some: { id } } } });
      case 'camera_recorder':
        return this.db.camera_recorder_camera.count({ where: { camera_recorder: { some: { id } } } });
      case 'camera_playback':
        if (!url) return 0;
        return this.db.camera_recorder.count({ where: { url } });
      case 'lpr_service':
        return this.db.camera_lpr_camera.count({ where: { camera_lpr: { some: { id } } } });
      case 'mismatch_service':
        return this.db.mismatch.count({ where: { mismatch_service: { some: { id } } } });
      default:
        return 0;
    }
  }

  async getAll(): Promise<generalResponse> {
    try {
      const [
        cameraServices,
        cameraRecorders,
        cameraPlaybacks,
        lprServices,
        mismatchServices,
        availability,
      ] = await Promise.all([
        this.db.camera_service.findMany({ orderBy: [{ created_at: 'desc' }] }),
        this.db.camera_recorder.findMany({ orderBy: [{ created_at: 'desc' }] }),
        this.db.camera_playback.findMany({ orderBy: [{ created_at: 'desc' }] }),
        this.db.camera_lpr.findMany({ orderBy: [{ created_at: 'desc' }] }),
        this.db.mismatch_service.findMany({ orderBy: [{ created_at: 'desc' }] }),
        this.cameraServiceService.listServiceAvailability(),
      ]);
      const availabilityMap = new Map(availability.map((s) => [s.id, s]));

      const mapWorker = async (type: WorkerType, row: { id: string; url: string; port: string; created_at: Date; updated_at?: Date; port_from?: string; port_to?: string }) => {
        const assignments = await this.assignmentCount(type, row.id, row.url);
        const online = await this.probe(row.url, row.port, WORKER_PROBE[type]);
        const base = {
          id: row.id,
          type,
          url: row.url,
          port: row.port,
          created_at: row.created_at,
          updated_at: row.updated_at ?? row.created_at,
          online,
          assignments,
          canDelete: assignments === 0,
        };
        if (type === 'camera_service') {
          const capacity = availabilityMap.get(row.id);
          return {
            ...base,
            port_from: row.port_from,
            port_to: row.port_to,
            capacity,
          };
        }
        return base;
      };

      const workers = [
        ...(await Promise.all(cameraServices.map((row) => mapWorker('camera_service', row)))),
        ...(await Promise.all(cameraRecorders.map((row) => mapWorker('camera_recorder', row)))),
        ...(await Promise.all(cameraPlaybacks.map((row) => mapWorker('camera_playback', row)))),
        ...(await Promise.all(lprServices.map((row) => mapWorker('lpr_service', row)))),
        ...(await Promise.all(mismatchServices.map((row) => mapWorker('mismatch_service', row)))),
      ];

      return { status: true, data: { workers }, error: null, msg: null };
    } catch (error) {
      throw new HttpException(toErrorResponse(error, 'Failed to list workers'), 406);
    }
  }

  async deleteWorker(type: string, id: string): Promise<generalResponse> {
    try {
      if (!Object.prototype.hasOwnProperty.call(WORKER_PROBE, type)) {
        throw new HttpException({ status: false, data: null, error: 'Invalid worker type', msg: 'Invalid worker type' }, 406);
      }
      const workerType = type as WorkerType;
      const row = await this.getWorkerRow(workerType, id);
      if (!row) {
        throw new HttpException({ status: false, data: null, error: 'Worker not found', msg: 'Worker not found' }, 406);
      }
      const assignments = await this.assignmentCount(workerType, id, row.url);
      if (assignments > 0) {
        throw new HttpException({
          status: false,
          data: null,
          error: 'Worker has assignments',
          msg: `Cannot delete worker with ${assignments} assignment(s). Reassign or remove cameras first.`,
        }, 406);
      }

      switch (workerType) {
        case 'camera_service':
          await this.db.camera_service.delete({ where: { id } });
          break;
        case 'camera_recorder':
          await this.db.camera_recorder.delete({ where: { id } });
          break;
        case 'camera_playback':
          await this.db.camera_playback.delete({ where: { id } });
          break;
        case 'lpr_service':
          await this.db.camera_lpr.delete({ where: { id } });
          break;
        case 'mismatch_service':
          await this.db.mismatch_service.delete({ where: { id } });
          break;
        default:
          throw new HttpException({ status: false, data: null, error: 'Invalid worker type', msg: 'Invalid worker type' }, 406);
      }

      return { status: true, data: { id, type }, error: null, msg: null };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(toErrorResponse(error, 'Failed to delete worker'), 406);
    }
  }

  private async getWorkerRow(type: WorkerType, id: string): Promise<{ id: string; url: string; port: string } | null> {
    switch (type) {
      case 'camera_service':
        return this.db.camera_service.findUnique({ where: { id }, select: { id: true, url: true, port: true } });
      case 'camera_recorder':
        return this.db.camera_recorder.findUnique({ where: { id }, select: { id: true, url: true, port: true } });
      case 'camera_playback':
        return this.db.camera_playback.findUnique({ where: { id }, select: { id: true, url: true, port: true } });
      case 'lpr_service':
        return this.db.camera_lpr.findUnique({ where: { id }, select: { id: true, url: true, port: true } });
      case 'mismatch_service':
        return this.db.mismatch_service.findUnique({ where: { id }, select: { id: true, url: true, port: true } });
      default:
        return null;
    }
  }
}
