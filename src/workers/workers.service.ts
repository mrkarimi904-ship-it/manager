import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { DbService } from 'src/db/db.service';
import { CameraServiceService } from 'src/camera_service/camera_service.service';
import { generalResponse } from 'src/app.consts';
import { toErrorResponse } from 'src/common/error.util';

type WorkerType = 'camera_service' | 'camera_recorder' | 'camera_playback' | 'lpr_service' | 'mismatch_service';

const WORKER_PROBE: Record<WorkerType, string> = {
  camera_service: '/camera_service',
  camera_recorder: '/camera_recorder/recorder',
  camera_playback: '/camera_playback',
  lpr_service: '/lpr_service',
  mismatch_service: '/lpr-mismatch/status',
};

@Injectable()
export class WorkersService {
  constructor(
    private db: DbService,
    private readonly axios: HttpService,
    private cameraServiceService: CameraServiceService,
  ) {}

  private async probe(url: string, port: string, path: string): Promise<boolean> {
    try {
      await this.axios.axiosRef.get(`http://${url}:${port}${path}`, { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  private async getCameraSummaries(cameraIds: string[]): Promise<{ id: string; name: string }[]> {
    const uniqueIds = [...new Set(cameraIds.filter(Boolean))];
    if (!uniqueIds.length) return [];

    const cameras = await this.db.camera.findMany({
      where: { id: { in: uniqueIds }, deleted: false },
      select: {
        id: true,
        url: true,
        camera_info: { where: { key: 'name' }, select: { value: true }, take: 1 },
      },
    });

    return cameras.map((camera) => ({
      id: camera.id,
      name: camera.camera_info[0]?.value || camera.url || camera.id,
    }));
  }

  private async resolveAssignmentCameraIds(type: WorkerType, id: string, url?: string): Promise<string[]> {
    switch (type) {
      case 'camera_service': {
        const rows = await this.db.camera_service_camera.findMany({
          where: { camera_service: { some: { id } } },
          select: { camera: { select: { id: true } } },
        });
        return rows.flatMap((row) => row.camera.map((camera) => camera.id));
      }
      case 'camera_recorder': {
        const rows = await this.db.camera_recorder_camera.findMany({
          where: { camera_recorder: { some: { id } } },
          select: { camera: { select: { id: true } } },
        });
        return rows.flatMap((row) => row.camera.map((camera) => camera.id));
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
          select: { camera: { select: { id: true } } },
        });
        return rows.flatMap((row) => row.camera.map((camera) => camera.id));
      }
      case 'lpr_service': {
        const rows = await this.db.camera_lpr_camera.findMany({
          where: { camera_lpr: { some: { id } } },
          select: { camera: { select: { id: true } } },
        });
        return rows.flatMap((row) => row.camera.map((camera) => camera.id));
      }
      case 'mismatch_service': {
        const mismatches = await this.db.mismatch.findMany({
          where: { mismatch_service: { some: { id } } },
          select: { camera1_id: true, camera2_id: true },
        });
        return mismatches.flatMap((mismatch) => [mismatch.camera1_id, mismatch.camera2_id]);
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

      const cameraIds = await this.resolveAssignmentCameraIds(workerType, id, row.url);
      const cameras = await this.getCameraSummaries(cameraIds);

      return { status: true, data: { cameras }, error: null, msg: null };
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

  private async getWorkerRow(type: WorkerType, id: string): Promise<{ id: string; url: string } | null> {
    switch (type) {
      case 'camera_service':
        return this.db.camera_service.findUnique({ where: { id }, select: { id: true, url: true } });
      case 'camera_recorder':
        return this.db.camera_recorder.findUnique({ where: { id }, select: { id: true, url: true } });
      case 'camera_playback':
        return this.db.camera_playback.findUnique({ where: { id }, select: { id: true, url: true } });
      case 'lpr_service':
        return this.db.camera_lpr.findUnique({ where: { id }, select: { id: true, url: true } });
      case 'mismatch_service':
        return this.db.mismatch_service.findUnique({ where: { id }, select: { id: true, url: true } });
      default:
        return null;
    }
  }
}
