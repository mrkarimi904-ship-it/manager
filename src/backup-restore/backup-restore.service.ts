import { HttpException, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DbService } from 'src/db/db.service';
import { StorageService } from 'src/storage/storage.service';
import { LoggerService } from 'src/logger/logger.service';
import { generalResponse } from 'src/app.consts';

import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import * as AdmZip from 'adm-zip';
import { promises as fsPromises } from 'fs';
import { randomUUID } from 'crypto';
import checkDiskSpace from 'check-disk-space';

const LPR_IMAGE_FILES = [
  { file: 'plateimage.jpg', field: 'plateimage' },
  { file: 'vehicleimage.jpg', field: 'vehicleimage' },
  { file: 'frame.jpg', field: 'frame' },
  { file: 'generatedplateimage.jpg', field: 'generatedplateimage' },
] as const;

type RestoreType = 'lpr' | 'logger';

type RestoreResult = {
  filename: string;
  restored: number;
  skipped: number;
  failed: number;
  errors: string[];
};

@Injectable()
export class BackupRestoreService {
  private isRunning = false;
  private isRestoring = false;

  // in-memory disk space state
  private diskSpaceStatus: {
    postgres?: { path: string; totalBytes: number; freeBytes: number; usedPercent: number; error?: string };
    minio?: { path: string; totalBytes: number; freeBytes: number; usedPercent: number; error?: string };
    checkedAt: Date | null;
  } = { checkedAt: null };

  // track when emergency stop was triggered to avoid repeated attempts
  private emergencyStopTriggered = false;

  // cached settings for the current cron tick (cleared after each tick)
  private cachedSettings: any = null;

  constructor(
    private readonly db: DbService,
    private readonly storageService: StorageService,
    private readonly loggerService: LoggerService,
  ) {}

  /**
   * Read backup-restore settings from DB, falling back to env vars.
   * Result is cached for the duration of one cron tick so all methods
   * in the same tick use consistent values.
   */
  async getSettings(): Promise<any> {
    if (this.cachedSettings) return this.cachedSettings;

    try {
      const dbSettings = await this.db.setting_backup_restore.findFirst();
      if (dbSettings) {
        this.cachedSettings = dbSettings;
        return dbSettings;
      }
    } catch {
      // DB not available — fall through to env vars
    }

    // hardcoded defaults (DB is the source of truth; this is only used if DB is unreachable)
    this.cachedSettings = {
      postgres_data_path:               '/var/lib/postgresql/data',
      minio_data_path:                  '/data',
      disk_space_start_archive_percent: 20,
      disk_space_stop_archive_percent:  30,
      disk_space_critical_percent:      5,
      lpr_backup_batch_size:            1000,
      lpr_backup_min_age_days:          7,
      lpr_backup_enabled:               false,
      logger_backup_keep_count:         100000,
      logger_backup_batch_size:         50000,
      logger_backup_enabled:            false,
      rotation_backup_type:             'local',
      rotation_backup_local_path:       '/mnt/backup-storage/lpr-archives',
      rotation_backup_s3_endpoint:      '',
      rotation_backup_s3_bucket:        '',
      rotation_backup_s3_access_key:    '',
      rotation_backup_s3_secret_key:    '',
    };
    return this.cachedSettings;
  }

  // ── cron entry point (every 60s) ──

  @Cron('0 * * * * *')
  async handleCron() {
    if (this.isRunning || this.isRestoring) return;
    this.isRunning = true;
    this.cachedSettings = null; // fresh DB read each tick

    try {
      const settings = await this.getSettings();

      // 1. check disk space on all monitored paths
      await this.checkDiskSpace(settings);

      const minFree = this.getMinFreePercent();
      if (minFree === null) return; // no paths configured

      const startThreshold = settings.disk_space_start_archive_percent;
      const stopThreshold = settings.disk_space_stop_archive_percent;
      const criticalThreshold = settings.disk_space_critical_percent;

      // 2. if above stop threshold, nothing to do — reset emergency flag
      if (minFree >= stopThreshold) {
        if (this.emergencyStopTriggered) {
          await this.loggerService.log(
            `Disk space recovered to ${minFree.toFixed(1)}% — above stop threshold ${stopThreshold}%. LPR instances must be restarted manually.`,
            1, // warning level
          );
          this.emergencyStopTriggered = false;
        }
        return;
      }

      // 3. if below start threshold, run one LPR archive batch (if enabled)
      if (minFree < startThreshold) {
        let lprArchived = 0;
        if (settings.lpr_backup_enabled) {
          lprArchived = await this.archiveLprBatch(settings);
        }

        // 4. re-check disk space after archiving
        await this.checkDiskSpace(settings);
        const newMinFree = this.getMinFreePercent();

        // 5. if still below critical threshold AND nothing was archived, trigger emergency LPR stop
        if (newMinFree !== null && newMinFree < criticalThreshold) {
          if (lprArchived === 0) {
            await this.emergencyStopLpr(newMinFree, criticalThreshold);
          } else if (newMinFree < criticalThreshold) {
            await this.emergencyStopLpr(newMinFree, criticalThreshold);
          }
        }
      }
    } catch (error) {
      await this.loggerService.log(
        `BackupRestore cron failed: ${error?.message || error}`,
        1,
      );
    } finally {
      this.isRunning = false;
    }
  }

  // ── logger backup cron (every 5 min, independent of disk space) ──

  @Cron('0 */5 * * * *')
  async handleLoggerBackupCron() {
    if (this.isRestoring) return;
    try {
      const settings = await this.getSettings();

      if (!settings.logger_backup_enabled) return;

      const totalCount = await this.db.logger_logs.count();
      if (totalCount <= settings.logger_backup_keep_count) return;

      await this.archiveLoggerBatch(settings);
    } catch (error) {
      await this.loggerService.log(
        `Logger backup cron failed: ${error?.message || error}`,
        1,
      );
    }
  }

  // ── disk space ──

  /**
   * Check disk space on all configured paths using check-disk-space.
   * Async, non-blocking. Stores results in memory.
   */
  async checkDiskSpace(settings: any) {
    const postgresPath = settings.postgres_data_path || '';
    const minioPath = settings.minio_data_path || '';

    if (postgresPath) {
      try {
        const result = await checkDiskSpace(postgresPath);
        this.diskSpaceStatus.postgres = {
          path: result.diskPath,
          totalBytes: result.size,
          freeBytes: result.free,
          usedPercent: result.size > 0 ? ((result.size - result.free) / result.size) * 100 : 0,
        };
      } catch (error) {
        this.diskSpaceStatus.postgres = {
          path: postgresPath,
          totalBytes: 0,
          freeBytes: 0,
          usedPercent: 0,
          error: error?.message || 'checkDiskSpace failed',
        };
      }
    } else {
      delete this.diskSpaceStatus.postgres;
    }

    if (minioPath) {
      try {
        const result = await checkDiskSpace(minioPath);
        this.diskSpaceStatus.minio = {
          path: result.diskPath,
          totalBytes: result.size,
          freeBytes: result.free,
          usedPercent: result.size > 0 ? ((result.size - result.free) / result.size) * 100 : 0,
        };
      } catch (error) {
        this.diskSpaceStatus.minio = {
          path: minioPath,
          totalBytes: 0,
          freeBytes: 0,
          usedPercent: 0,
          error: error?.message || 'checkDiskSpace failed',
        };
      }
    } else {
      delete this.diskSpaceStatus.minio;
    }

    this.diskSpaceStatus.checkedAt = new Date();
  }

  /**
   * Returns the minimum free percent across all monitored paths.
   * Returns null if no paths are configured.
   */
  getMinFreePercent(): number | null {
    const values: number[] = [];
    if (this.diskSpaceStatus.postgres && !this.diskSpaceStatus.postgres.error) {
      values.push(100 - this.diskSpaceStatus.postgres.usedPercent);
    }
    if (this.diskSpaceStatus.minio && !this.diskSpaceStatus.minio.error) {
      values.push(100 - this.diskSpaceStatus.minio.usedPercent);
    }
    if (values.length === 0) return null;
    return Math.min(...values);
  }

  /**
   * Returns current disk space snapshot (exposed to controller).
   */
  getDiskSpaceStatus() {
    const minFree = this.getMinFreePercent();
    return {
      ...this.diskSpaceStatus,
      minFreePercent: minFree,
    };
  }

  // ── restore ──

  async restoreLpr(filename: string, user?: any): Promise<generalResponse> {
    return this.runRestore('lpr', filename, user);
  }

  async restoreLogger(filename: string, user?: any): Promise<generalResponse> {
    return this.runRestore('logger', filename, user);
  }

  private async runRestore(type: RestoreType, filename: string, user?: any): Promise<generalResponse> {
    if (this.isRestoring) {
      throw new HttpException({ status: false, data: null, error: 'Restore in progress', msg: 'Another restore is already running' }, 406);
    }

    this.isRestoring = true;
    this.cachedSettings = null;

    const safeFilename = this.validateBackupFilename(filename, type);
    let tempZipPath: string | null = null;
    let extractDir: string | null = null;
    let deleteTempZip = false;

    try {
      const settings = await this.getSettings();
      const zipResolution = await this.resolveBackupZipPath(safeFilename, settings);
      tempZipPath = zipResolution.zipPath;
      deleteTempZip = zipResolution.deleteAfterUse;

      extractDir = await this.extractBackupZip(tempZipPath);

      const result = type === 'lpr'
        ? await this.restoreLprFromExtractDir(extractDir)
        : await this.restoreLoggerFromExtractDir(extractDir);

      result.filename = safeFilename;

      await this.loggerService.log(
        `${type.toUpperCase()} restore completed: ${result.restored} restored, ${result.skipped} skipped, ${result.failed} failed (${safeFilename})`,
        result.failed > 0 ? 1 : 0,
        user,
      );

      return { status: true, data: result, error: null, msg: null };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException({
        status: false,
        data: null,
        error: error,
        msg: error?.message || 'Restore failed',
      }, 406);
    } finally {
      if (extractDir) await this.cleanupTempDir(extractDir);
      if (tempZipPath && deleteTempZip) await this.cleanupTempFile(tempZipPath);
      this.isRestoring = false;
    }
  }

  private validateBackupFilename(filename: string, type: RestoreType): string {
    const base = path.basename(filename);
    if (base !== filename || base.includes('..')) {
      throw new HttpException({ status: false, data: null, error: 'Invalid filename', msg: 'Invalid backup filename' }, 406);
    }
    const pattern = type === 'lpr' ? /^lpr_backup_.+\.zip$/ : /^logger_backup_.+\.zip$/;
    if (!pattern.test(base)) {
      throw new HttpException({ status: false, data: null, error: 'Invalid filename', msg: `Filename must match ${type} backup pattern` }, 406);
    }
    return base;
  }

  private getExportRoot(): string {
    return path.join(__dirname, '..', '..', 'exports');
  }

  private createBackupS3Client(settings: any) {
    const endpoint = settings.rotation_backup_s3_endpoint;
    const accessKey = settings.rotation_backup_s3_access_key;
    const secretKey = settings.rotation_backup_s3_secret_key;

    if (!endpoint || !accessKey || !secretKey) {
      throw new HttpException({ status: false, data: null, error: 'S3 not configured', msg: 'S3 backup destination not fully configured' }, 406);
    }

    const MinIO = require('minio');
    const url = new URL(endpoint);
    const useSSL = url.protocol === 'https:';
    return new MinIO.Client({
      endPoint: url.hostname,
      port: parseInt(url.port) || (useSSL ? 443 : 9000),
      useSSL,
      accessKey,
      secretKey,
    });
  }

  private async resolveBackupZipPath(filename: string, settings: any): Promise<{ zipPath: string; deleteAfterUse: boolean }> {
    if (settings.rotation_backup_type === 's3') {
      const bucket = settings.rotation_backup_s3_bucket;
      if (!bucket) {
        throw new HttpException({ status: false, data: null, error: 'S3 bucket missing', msg: 'S3 backup bucket not configured' }, 406);
      }

      const exportRoot = this.getExportRoot();
      await fsPromises.mkdir(exportRoot, { recursive: true });
      const tempZipPath = path.join(exportRoot, `restore_download_${randomUUID()}.zip`);

      const client = this.createBackupS3Client(settings);
      try {
        await client.statObject(bucket, filename);
      } catch {
        throw new HttpException({ status: false, data: null, error: 'Backup not found', msg: `Backup file not found: ${filename}` }, 406);
      }

      await client.fGetObject(bucket, filename, tempZipPath);
      return { zipPath: tempZipPath, deleteAfterUse: true };
    }

    const backupDir = settings.rotation_backup_local_path;
    if (!backupDir) {
      throw new HttpException({ status: false, data: null, error: 'Local path missing', msg: 'Local backup path not configured' }, 406);
    }

    const zipPath = path.join(backupDir, filename);
    if (!fs.existsSync(zipPath)) {
      throw new HttpException({ status: false, data: null, error: 'Backup not found', msg: `Backup file not found: ${zipPath}` }, 406);
    }

    return { zipPath, deleteAfterUse: false };
  }

  private async extractBackupZip(zipPath: string): Promise<string> {
    const exportRoot = this.getExportRoot();
    await fsPromises.mkdir(exportRoot, { recursive: true });
    const extractDir = path.join(exportRoot, `restore_${randomUUID()}`);

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);

    return extractDir;
  }

  private async readJsonFile<T>(filePath: string): Promise<T> {
    const raw = await fsPromises.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  }

  private async restoreLprFromExtractDir(extractDir: string): Promise<RestoreResult> {
    const recordsPath = path.join(extractDir, 'records.json');
    if (!fs.existsSync(recordsPath)) {
      throw new HttpException({ status: false, data: null, error: 'Invalid backup', msg: 'records.json not found in backup archive' }, 406);
    }

    const records = await this.readJsonFile<any[]>(recordsPath);
    if (!Array.isArray(records)) {
      throw new HttpException({ status: false, data: null, error: 'Invalid backup', msg: 'records.json must be an array' }, 406);
    }

    records.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const result: RestoreResult = { filename: '', restored: 0, skipped: 0, failed: 0, errors: [] };

    for (const record of records) {
      try {
        const existing = await this.db.lpr_result.findUnique({ where: { id: record.id }, select: { id: true } });
        if (existing) {
          result.skipped++;
          continue;
        }

        const cameraIds: string[] = Array.isArray(record.camera_ids) ? record.camera_ids : [];
        const existingCameras = cameraIds.length
          ? await this.db.camera.findMany({ where: { id: { in: cameraIds } }, select: { id: true } })
          : [];
        const connectCameras = existingCameras.map((c) => ({ id: c.id }));

        const {
          id,
          camera_ids,
          lpr_result_image,
          camera,
          ...scalarFields
        } = record;

        const images = await this.readLprImagesFromExtract(extractDir, id);

        await this.db.$transaction(async (tx) => {
          await tx.lpr_result.create({
            data: {
              ...scalarFields,
              id,
              created_at: new Date(record.created_at),
              ...(connectCameras.length ? { camera: { connect: connectCameras } } : {}),
            },
          });

          if (Object.keys(images).length > 0) {
            if (this.storageService.isMinIOEnabled()) {
              try {
                await this.storageService.uploadLprImages(id, images);
              } catch {
                await tx.lpr_result_image.create({
                  data: {
                    plateimage: images.plateimage || '',
                    vehicleimage: images.vehicleimage || '',
                    frame: images.frame || '',
                    generatedplateimage: images.generatedplateimage || '',
                    lpr_result: { connect: { id } },
                  },
                });
              }
            } else {
              await tx.lpr_result_image.create({
                data: {
                  plateimage: images.plateimage || '',
                  vehicleimage: images.vehicleimage || '',
                  frame: images.frame || '',
                  generatedplateimage: images.generatedplateimage || '',
                  lpr_result: { connect: { id } },
                },
              });
            }
          }
        });

        result.restored++;
      } catch (error) {
        result.failed++;
        if (result.errors.length < 20) {
          result.errors.push(`${record.id}: ${error?.message || error}`);
        }
      }
    }

    return result;
  }

  private async readLprImagesFromExtract(extractDir: string, recordId: string): Promise<Record<string, string>> {
    const images: Record<string, string> = {};
    const imageDir = path.join(extractDir, 'images', recordId);

    for (const { file, field } of LPR_IMAGE_FILES) {
      const filePath = path.join(imageDir, file);
      if (!fs.existsSync(filePath)) continue;
      const buffer = await fsPromises.readFile(filePath);
      if (buffer.length > 0) {
        images[field] = buffer.toString('base64');
      }
    }

    return images;
  }

  private async restoreLoggerFromExtractDir(extractDir: string): Promise<RestoreResult> {
    const logsPath = path.join(extractDir, 'logs.json');
    if (!fs.existsSync(logsPath)) {
      throw new HttpException({ status: false, data: null, error: 'Invalid backup', msg: 'logs.json not found in backup archive' }, 406);
    }

    const logs = await this.readJsonFile<any[]>(logsPath);
    if (!Array.isArray(logs)) {
      throw new HttpException({ status: false, data: null, error: 'Invalid backup', msg: 'logs.json must be an array' }, 406);
    }

    const result: RestoreResult = { filename: '', restored: 0, skipped: 0, failed: 0, errors: [] };
    const batchSize = 500;

    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      const ids = batch.map((log) => log.id);
      const existing = await this.db.logger_logs.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((row) => row.id));

      const toCreate = batch.filter((log) => !existingIds.has(log.id));
      result.skipped += batch.length - toCreate.length;

      if (toCreate.length === 0) continue;

      try {
        await this.db.logger_logs.createMany({
          data: toCreate.map((log) => ({
            id: log.id,
            log: log.log,
            level: log.level,
            by: log.by,
            user: log.user,
            user_group: log.user_group,
            camera: log.camera,
            camera_group: log.camera_group,
            created_at: new Date(log.created_at),
          })),
          skipDuplicates: true,
        });
        result.restored += toCreate.length;
      } catch (error) {
        for (const log of toCreate) {
          try {
            await this.db.logger_logs.create({
              data: {
                id: log.id,
                log: log.log,
                level: log.level,
                by: log.by,
                user: log.user,
                user_group: log.user_group,
                camera: log.camera,
                camera_group: log.camera_group,
                created_at: new Date(log.created_at),
              },
            });
            result.restored++;
          } catch (rowError) {
            result.failed++;
            if (result.errors.length < 20) {
              result.errors.push(`${log.id}: ${rowError?.message || rowError}`);
            }
          }
        }
      }
    }

    return result;
  }

  // ── LPR backup ──

  /**
   * Archive one batch of oldest LPR results.
   * Returns the number of records archived (0 if none eligible or backup failed).
   */
  private async archiveLprBatch(settings: any): Promise<number> {
    const batchSize = settings.lpr_backup_batch_size;
    const minAgeDays = settings.lpr_backup_min_age_days;
    const cutoff = new Date(Date.now() - minAgeDays * 86400_000);

    try {
      // find oldest records older than min age
      const records = await this.db.lpr_result.findMany({
        where: { created_at: { lt: cutoff } },
        include: {
          lpr_result_image: true,
          camera: { select: { id: true } },
        },
        orderBy: { created_at: 'asc' },
        take: batchSize,
      });

      if (records.length === 0) return 0;

      // collect images for each record
      const archiveEntries: Array<{
        record: any;
        images: Array<{ name: string; data: Buffer | null }>;
      }> = [];

      for (const record of records) {
        const images = await this.collectImagesForRecord(record);
        archiveEntries.push({ record, images });
      }

      // build zip
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const oldestDate = records[0].created_at.toISOString().replace(/[:.]/g, '-');
      const newestDate = records[records.length - 1].created_at.toISOString().replace(/[:.]/g, '-');
      const zipName = `lpr_backup_${timestamp}_${oldestDate}_to_${newestDate}.zip`;

      const { zipPath, zipSize } = await this.buildLprZip(archiveEntries, zipName);

      // upload to backup destination
      await this.uploadToBackup(zipPath, zipName, settings);

      // verify
      const verified = await this.verifyBackup(zipName, zipSize, settings);
      if (!verified) {
        await this.loggerService.log(
          `LPR backup verification FAILED for ${zipName} (${records.length} records). Data NOT deleted.`,
          1,
        );
        await this.cleanupTempFile(zipPath);
        return 0;
      }

      // delete originals
      await this.deleteOriginalLprData(records.map((r) => r.id));

      // clean up temp zip
      await this.cleanupTempFile(zipPath);

      await this.loggerService.log(
        `LPR backup SUCCESS: ${records.length} records archived to ${zipName} (${(zipSize / 1024 / 1024).toFixed(1)} MB)`,
        0,
      );

      return records.length;
    } catch (error) {
      await this.loggerService.log(
        `LPR backup FAILED: ${error?.message || error}`,
        1,
      );
      return 0;
    }
  }

  /**
   * Collect images for a single LPR record from MinIO (or DB fallback).
   */
  private async collectImagesForRecord(record: any): Promise<Array<{ name: string; data: Buffer | null }>> {
    const imageRecord = record.lpr_result_image?.[0];
    const result: Array<{ name: string; data: Buffer | null }> = [];

    const fields = [
      { key: 'plateimage', filename: '1.jpg', label: 'plateimage' },
      { key: 'vehicleimage', filename: '2.jpg', label: 'vehicleimage' },
      { key: 'frame', filename: '3.jpg', label: 'frame' },
      { key: 'generatedplateimage', filename: '4.jpg', label: 'generatedplateimage' },
    ];

    for (const { key, filename, label } of fields) {
      let buffer: Buffer | null = null;

      if (this.storageService.isMinIOEnabled()) {
        // try MinIO first
        const minioPath = `${record.id}/${filename}`;
        const base64 = await this.storageService.getImageAsBase64(minioPath);
        if (base64) {
          buffer = Buffer.from(base64, 'base64');
        }
      }

      // fallback to DB if MinIO didn't have it
      if (!buffer && imageRecord && imageRecord[label]) {
        // check if it's a MinIO path (stored as path in DB fallback) or base64
        const val = imageRecord[label];
        if (this.storageService.isMinIOPath(val)) {
          const base64 = await this.storageService.getImageAsBase64(val);
          if (base64) buffer = Buffer.from(base64, 'base64');
        } else {
          // it's base64
          buffer = Buffer.from(val, 'base64');
        }
      }

      result.push({ name: `${label}.jpg`, data: buffer });
    }

    return result;
  }

  /**
   * Build a zip file containing LPR records as JSON and their images.
   */
  private async buildLprZip(
    entries: Array<{
      record: any;
      images: Array<{ name: string; data: Buffer | null }>;
    }>,
    zipName: string,
  ): Promise<{ zipPath: string; zipSize: number }> {
    const exportRoot = path.join(__dirname, '..', '..', 'exports');
    await fsPromises.mkdir(exportRoot, { recursive: true });

    const zipPath = path.join(exportRoot, zipName);

    // serialize records to JSON (strip circular references and large fields)
    const recordsJson = entries.map((e) => {
      const r = { ...e.record };
      // remove the included relations to avoid circular refs
      delete r.lpr_result_image;
      // flatten camera relation
      r.camera_ids = e.record.camera?.map((c: any) => c.id) || [];
      delete r.camera;
      return r;
    });

    const metadata = {
      archivedAt: new Date().toISOString(),
      recordCount: entries.length,
      oldestRecordDate: entries[0]?.record?.created_at || null,
      newestRecordDate: entries[entries.length - 1]?.record?.created_at || null,
      minioEnabled: this.storageService.isMinIOEnabled(),
    };

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        resolve({ zipPath, zipSize: archive.pointer() });
      });

      archive.on('error', (err: Error) => {
        reject(err);
      });

      archive.pipe(output);

      // add metadata.json
      archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

      // add records.json
      archive.append(JSON.stringify(recordsJson, null, 2), { name: 'records.json' });

      // add images
      for (const entry of entries) {
        for (const img of entry.images) {
          if (img.data && img.data.length > 0) {
            archive.append(img.data, { name: `images/${entry.record.id}/${img.name}` });
          }
        }
      }

      archive.finalize();
    });
  }

  /**
   * Delete original LPR data from DB and MinIO after verified backup.
   */
  private async deleteOriginalLprData(ids: string[]): Promise<void> {
    // 1. delete MinIO objects for each record
    if (this.storageService.isMinIOEnabled()) {
      const results = await Promise.allSettled(
        ids.map((id) => this.storageService.deleteLprImages(id)),
      );
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        await this.loggerService.log(
          `Failed to delete ${failed.length} MinIO objects during LPR cleanup`,
          1,
        );
      }
    }

    // 2. delete lpr_result_image DB rows (those that exist from fallback cases)
    try {
      await this.db.lpr_result_image.deleteMany({
        where: { lpr_result: { some: { id: { in: ids } } } },
      });
    } catch (error) {
      await this.loggerService.log(
        `Failed to delete lpr_result_image rows: ${error?.message || error}`,
        1,
      );
    }

    // 3. delete lpr_result rows
    try {
      const result = await this.db.lpr_result.deleteMany({
        where: { id: { in: ids } },
      });
      // also clean up any orphaned image rows
      await this.db.lpr_result_image.deleteMany({
        where: { lpr_result: { none: {} } },
      });
    } catch (error) {
      await this.loggerService.log(
        `Failed to delete lpr_result rows: ${error?.message || error}. Data is safe in backup.`,
        1,
      );
    }
  }

  // ── logger backup ──

  /**
   * Archive one batch of oldest logger logs.
   * Keeps the configured number of recent entries, archives anything older.
   * Returns the number of records archived.
   */
  private async archiveLoggerBatch(settings: any): Promise<number> {
    const keepCount = settings.logger_backup_keep_count;
    const batchSize = settings.logger_backup_batch_size;

    try {
      // find the ID of the Nth most recent record (the cutoff)
      const recentRecords = await this.db.logger_logs.findMany({
        orderBy: { created_at: 'desc' },
        take: keepCount,
        select: { id: true },
      });

      if (recentRecords.length < keepCount) {
        // we have fewer than keepCount total — nothing to archive
        return 0;
      }

      const recentIds = recentRecords.map((r) => r.id);

      // find oldest records beyond the keep count
      const toArchive = await this.db.logger_logs.findMany({
        where: { NOT: { id: { in: recentIds } } },
        orderBy: { created_at: 'asc' },
        take: batchSize,
      });

      if (toArchive.length === 0) return 0;

      // build zip
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const oldestDate = toArchive[0].created_at.toISOString().replace(/[:.]/g, '-');
      const newestDate = toArchive[toArchive.length - 1].created_at.toISOString().replace(/[:.]/g, '-');
      const zipName = `logger_backup_${timestamp}_${oldestDate}_to_${newestDate}.zip`;

      const exportRoot = path.join(__dirname, '..', '..', 'exports');
      await fsPromises.mkdir(exportRoot, { recursive: true });
      const zipPath = path.join(exportRoot, zipName);

      const metadata = {
        archivedAt: new Date().toISOString(),
        recordCount: toArchive.length,
        oldestRecordDate: oldestDate,
        newestRecordDate: newestDate,
      };

      // serialize (remove circular refs if any)
      const logsJson = toArchive.map((l) => ({
        id: l.id,
        log: l.log,
        level: l.level,
        by: l.by,
        user: l.user,
        user_group: l.user_group,
        camera: l.camera,
        camera_group: l.camera_group,
        created_at: l.created_at,
      }));

      await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => resolve());
        archive.on('error', (err: Error) => reject(err));
        archive.pipe(output);

        archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });
        archive.append(JSON.stringify(logsJson, null, 2), { name: 'logs.json' });
        archive.finalize();
      });

      const zipSize = fs.statSync(zipPath).size;

      // upload
      await this.uploadToBackup(zipPath, zipName, settings);

      // verify
      const verified = await this.verifyBackup(zipName, zipSize, settings);
      if (!verified) {
        await this.loggerService.log(
          `Logger backup verification FAILED for ${zipName} (${toArchive.length} records). Data NOT deleted.`,
          1,
        );
        await this.cleanupTempFile(zipPath);
        return 0;
      }

      // delete originals
      const idsToDelete = toArchive.map((r) => r.id);
      try {
        await this.db.logger_logs.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      } catch (error) {
        await this.loggerService.log(
          `Failed to delete logger rows: ${error?.message || error}. Data is safe in backup.`,
          1,
        );
      }

      // clean up temp zip
      await this.cleanupTempFile(zipPath);

      await this.loggerService.log(
        `Logger backup SUCCESS: ${toArchive.length} records archived to ${zipName} (${(zipSize / 1024).toFixed(1)} KB)`,
        0,
      );

      return toArchive.length;
    } catch (error) {
      await this.loggerService.log(
        `Logger backup FAILED: ${error?.message || error}`,
        1,
      );
      return 0;
    }
  }

  // ── backup destination ──

  /**
   * Upload a file to the configured backup destination.
   */
  private async uploadToBackup(localPath: string, remoteName: string, settings: any): Promise<string> {
    const backupType = settings.rotation_backup_type;

    if (backupType === 's3') {
      return this.uploadToS3(localPath, remoteName, settings);
    } else {
      return this.uploadToLocal(localPath, remoteName, settings);
    }
  }

  /**
   * Upload to S3-compatible storage.
   */
  private async uploadToS3(localPath: string, remoteName: string, settings: any): Promise<string> {
    const endpoint = settings.rotation_backup_s3_endpoint;
    const bucket = settings.rotation_backup_s3_bucket;
    const accessKey = settings.rotation_backup_s3_access_key;
    const secretKey = settings.rotation_backup_s3_secret_key;

    if (!endpoint || !bucket || !accessKey || !secretKey) {
      throw new Error('S3 backup destination not fully configured');
    }

    const MinIO = require('minio');
    const url = new URL(endpoint);
    const useSSL = url.protocol === 'https:';
    const client = new MinIO.Client({
      endPoint: url.hostname,
      port: parseInt(url.port) || (useSSL ? 443 : 9000),
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
    });

    // ensure bucket exists
    const bucketExists = await client.bucketExists(bucket);
    if (!bucketExists) {
      await client.makeBucket(bucket, 'us-east-1');
    }

    const fileStream = fs.createReadStream(localPath);
    const fileSize = fs.statSync(localPath).size;

    await client.putObject(bucket, remoteName, fileStream, fileSize, {
      'Content-Type': 'application/zip',
    });

    return `s3://${bucket}/${remoteName}`;
  }

  /**
   * Upload to a local filesystem path (mounted network drive, external disk, etc.).
   */
  private async uploadToLocal(localPath: string, remoteName: string, settings: any): Promise<string> {
    const backupDir = settings.rotation_backup_local_path;

    if (!backupDir) {
      throw new Error('ROTATION_BACKUP_LOCAL_PATH not configured');
    }

    await fsPromises.mkdir(backupDir, { recursive: true });

    const destPath = path.join(backupDir, remoteName);
    await fsPromises.copyFile(localPath, destPath);

    return destPath;
  }

  /**
   * Verify that the uploaded backup exists and has the expected size.
   */
  private async verifyBackup(remoteName: string, expectedSize: number, settings: any): Promise<boolean> {
    const backupType = settings.rotation_backup_type;

    try {
      if (backupType === 's3') {
        const endpoint = settings.rotation_backup_s3_endpoint;
        const bucket = settings.rotation_backup_s3_bucket;
        const accessKey = settings.rotation_backup_s3_access_key;
        const secretKey = settings.rotation_backup_s3_secret_key;

        if (!endpoint || !bucket) return false;

        const MinIO = require('minio');
        const url = new URL(endpoint);
        const useSSL = url.protocol === 'https:';
        const client = new MinIO.Client({
          endPoint: url.hostname,
          port: parseInt(url.port) || (useSSL ? 443 : 9000),
          useSSL: useSSL,
          accessKey: accessKey,
          secretKey: secretKey,
        });

        const stat = await client.statObject(bucket, remoteName);
        return stat.size === expectedSize;
      } else {
        // local
        const backupDir = settings.rotation_backup_local_path;
        if (!backupDir) return false;

        const destPath = path.join(backupDir, remoteName);
        const stats = fs.statSync(destPath);
        return stats.size === expectedSize;
      }
    } catch (error) {
      await this.loggerService.log(
        `Backup verification error for ${remoteName}: ${error?.message || error}`,
        1,
      );
      return false;
    }
  }

  // ── emergency LPR stop ──

  /**
   * Emergency stop: when disk space is below critical threshold AND
   * backup is not working (or not keeping up), stop all active LPR instances
   * to prevent the disk from filling completely.
   *
   * This does a direct DB update — matching the pattern used in
   * LprServiceService.handleCron().
   */
  private async emergencyStopLpr(currentFreePercent: number, criticalThreshold: number): Promise<void> {
    if (this.emergencyStopTriggered) return; // already stopped
    this.emergencyStopTriggered = true;

    try {
      // find all currently active LPR instances
      const activeLprs = await this.db.camera_lpr_camera.findMany({
        where: { isActive: true },
        select: { id: true, title: true, status: true },
      });

      if (activeLprs.length === 0) {
        await this.loggerService.log(
          `CRITICAL: Disk space at ${currentFreePercent.toFixed(1)}% (below ${criticalThreshold}%). No active LPR instances to stop. Backup may be broken — manual intervention required.`,
          1,
        );
        return;
      }

      // direct DB update: stop all active LPR cameras
      const result = await this.db.camera_lpr_camera.updateMany({
        where: { isActive: true },
        data: { status: 'STOPPED', isActive: false, session: '' },
      });

      await this.loggerService.log(
        `CRITICAL: Disk space at ${currentFreePercent.toFixed(1)}% (below ${criticalThreshold}%). ` +
        `EMERGENCY STOP: ${result.count} LPR instances stopped (${activeLprs.map((l) => l.title).join(', ')}). ` +
        `Backup is not keeping up or is failing. LPR processing halted to prevent data loss. ` +
        `LPR instances must be restarted manually after disk space is resolved.`,
        1,
      );

      // also notify admins via WebSocket
      await this.loggerService.log_and_notify_admins(
        `EMERGENCY: All ${result.count} LPR instances stopped — disk space critically low (${currentFreePercent.toFixed(1)}%). Restore disk space and restart LPRs manually.`,
        1,
      );
    } catch (error) {
      await this.loggerService.log(
        `EMERGENCY LPR STOP FAILED: ${error?.message || error}`,
        1,
      );
    }
  }

  // ── utilities ──

  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fsPromises.unlink(filePath);
    } catch {
      // ignore — temp file will be cleaned up eventually
    }
  }

  private async cleanupTempDir(dirPath: string): Promise<void> {
    try {
      await fsPromises.rm(dirPath, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}
