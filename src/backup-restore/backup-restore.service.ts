import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DbService } from 'src/db/db.service';
import { StorageService } from 'src/storage/storage.service';
import { LoggerService } from 'src/logger/logger.service';
import { generalResponse } from 'src/app.consts';

import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import { promises as fsPromises } from 'fs';
import checkDiskSpace from 'check-disk-space';

@Injectable()
export class BackupRestoreService {
  private isRunning = false;

  // in-memory disk space state
  private diskSpaceStatus: {
    postgres?: { path: string; totalBytes: number; freeBytes: number; usedPercent: number; error?: string };
    minio?: { path: string; totalBytes: number; freeBytes: number; usedPercent: number; error?: string };
    checkedAt: Date | null;
  } = { checkedAt: null };

  // track when emergency stop was triggered to avoid repeated attempts
  private emergencyStopTriggered = false;

  constructor(
    private readonly db: DbService,
    private readonly storageService: StorageService,
    private readonly loggerService: LoggerService,
  ) {}

  // ── helpers ──

  private config(key: string, fallback: string): string {
    return process.env[key] || fallback;
  }

  private configNum(key: string, fallback: number): number {
    const v = process.env[key];
    if (!v) return fallback;
    const n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  }

  // ── cron entry point (every 60s) ──

  @Cron('0 * * * * *')
  async handleCron() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      // 1. check disk space on all monitored paths
      await this.checkDiskSpace();

      const minFree = this.getMinFreePercent();
      if (minFree === null) return; // no paths configured

      const startThreshold = this.configNum('DISK_SPACE_START_ARCHIVE_PERCENT', 20);
      const stopThreshold = this.configNum('DISK_SPACE_STOP_ARCHIVE_PERCENT', 30);
      const criticalThreshold = this.configNum('DISK_SPACE_CRITICAL_PERCENT', 5);

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

      // 3. if below start threshold, run one archive batch
      if (minFree < startThreshold) {
        const lprArchived = await this.archiveLprBatch();
        const loggerArchived = await this.archiveLoggerBatch();

        // 4. re-check disk space after archiving
        await this.checkDiskSpace();
        const newMinFree = this.getMinFreePercent();

        // 5. if still below critical threshold AND nothing was archived (backup not working
        //    or no eligible records), trigger emergency LPR stop
        if (newMinFree !== null && newMinFree < criticalThreshold) {
          if (lprArchived === 0 && loggerArchived === 0) {
            // nothing was archived — backup is likely broken or no eligible data
            await this.emergencyStopLpr(newMinFree, criticalThreshold);
          } else if (newMinFree < criticalThreshold) {
            // archiving worked but disk is still critically low
            // keep archiving on next ticks, but also stop LPR to slow incoming data
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

  // ── disk space ──

  /**
   * Check disk space on all configured paths using check-disk-space.
   * Async, non-blocking. Stores results in memory.
   */
  async checkDiskSpace() {
    const postgresPath = this.config('POSTGRES_DATA_PATH', '');
    const minioPath = this.config('MINIO_DATA_PATH', '');

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

  // ── LPR backup ──

  /**
   * Archive one batch of oldest LPR results.
   * Returns the number of records archived (0 if none eligible or backup failed).
   */
  private async archiveLprBatch(): Promise<number> {
    const batchSize = this.configNum('LPR_BACKUP_BATCH_SIZE', 1000);
    const minAgeDays = this.configNum('LPR_BACKUP_MIN_AGE_DAYS', 7);
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
      const uploadRef = await this.uploadToBackup(zipPath, zipName);

      // verify
      const verified = await this.verifyBackup(zipName, zipSize);
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
  private async archiveLoggerBatch(): Promise<number> {
    const keepCount = this.configNum('LOGGER_BACKUP_KEEP_COUNT', 100000);
    const batchSize = this.configNum('LOGGER_BACKUP_BATCH_SIZE', 50000);

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
      await this.uploadToBackup(zipPath, zipName);

      // verify
      const verified = await this.verifyBackup(zipName, zipSize);
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
  private async uploadToBackup(localPath: string, remoteName: string): Promise<string> {
    const backupType = this.config('ROTATION_BACKUP_TYPE', 'local');

    if (backupType === 's3') {
      return this.uploadToS3(localPath, remoteName);
    } else {
      // default: local
      return this.uploadToLocal(localPath, remoteName);
    }
  }

  /**
   * Upload to S3-compatible storage using the existing MinIO client or a separate S3 endpoint.
   */
  private async uploadToS3(localPath: string, remoteName: string): Promise<string> {
    const endpoint = this.config('ROTATION_BACKUP_S3_ENDPOINT', '');
    const bucket = this.config('ROTATION_BACKUP_S3_BUCKET', '');
    const accessKey = this.config('ROTATION_BACKUP_S3_ACCESS_KEY', '');
    const secretKey = this.config('ROTATION_BACKUP_S3_SECRET_KEY', '');
    const region = this.config('ROTATION_BACKUP_S3_REGION', 'us-east-1');
    const useSSL = this.config('ROTATION_BACKUP_S3_USE_SSL', 'true') === 'true';

    if (!endpoint || !bucket || !accessKey || !secretKey) {
      throw new Error('S3 backup destination not fully configured');
    }

    // use dynamic import to avoid requiring the minio package if not using S3
    const MinIO = require('minio');
    const url = new URL(endpoint);
    const client = new MinIO.Client({
      endPoint: url.hostname,
      port: parseInt(url.port) || (useSSL ? 443 : 9000),
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
      region: region,
    });

    // ensure bucket exists
    const bucketExists = await client.bucketExists(bucket);
    if (!bucketExists) {
      await client.makeBucket(bucket, region);
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
  private async uploadToLocal(localPath: string, remoteName: string): Promise<string> {
    const backupDir = this.config('ROTATION_BACKUP_LOCAL_PATH', '');

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
  private async verifyBackup(remoteName: string, expectedSize: number): Promise<boolean> {
    const backupType = this.config('ROTATION_BACKUP_TYPE', 'local');

    try {
      if (backupType === 's3') {
        const endpoint = this.config('ROTATION_BACKUP_S3_ENDPOINT', '');
        const bucket = this.config('ROTATION_BACKUP_S3_BUCKET', '');
        const accessKey = this.config('ROTATION_BACKUP_S3_ACCESS_KEY', '');
        const secretKey = this.config('ROTATION_BACKUP_S3_SECRET_KEY', '');
        const region = this.config('ROTATION_BACKUP_S3_REGION', 'us-east-1');
        const useSSL = this.config('ROTATION_BACKUP_S3_USE_SSL', 'true') === 'true';

        if (!endpoint || !bucket) return false;

        const MinIO = require('minio');
        const url = new URL(endpoint);
        const client = new MinIO.Client({
          endPoint: url.hostname,
          port: parseInt(url.port) || (useSSL ? 443 : 9000),
          useSSL: useSSL,
          accessKey: accessKey,
          secretKey: secretKey,
          region: region,
        });

        const stat = await client.statObject(bucket, remoteName);
        return stat.size === expectedSize;
      } else {
        // local
        const backupDir = this.config('ROTATION_BACKUP_LOCAL_PATH', '');
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
}
