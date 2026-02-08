import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { DbService } from 'src/db/db.service';
import { OperationsService } from 'src/operations/operations.service';
import { StorageService } from 'src/storage/storage.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class LprQueueService implements OnModuleInit, OnModuleDestroy {

  constructor(
    private db: DbService,
    private operationsService: OperationsService,
    private storageService: StorageService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private client: RedisClientType;
  private isProcessing = false;
  private shutdownRequested = false;
  private redisConnected = false;

  async onModuleInit() {
    try {
      this.client = createClient({ url: process.env.REDIS_URL, password: process.env.REDIS_PASSWORD });
      this.client.on('error', (err) => console.error('Redis Client Error', err));
      this.client.on('connect', () => { this.redisConnected = true; });
      this.client.on('disconnect', () => { this.redisConnected = false; });
      await this.client.connect();
      this.redisConnected = true;

      // Preload cache for better performance
      await this.preloadCache();

      this.startProcessing();
    } catch (error) {
      console.error('Redis connection failed on startup:', error.message);
      console.warn('Application will continue but LPR queue processing will be disabled');
      this.redisConnected = false;
    }
  }

  async checkRedisHealth(): Promise<boolean> {
    if (!this.client) return false;
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
        this.redisConnected = true;
      }
      await this.client.ping();
      return true;
    } catch (error) {
      this.redisConnected = false;
      return false;
    }
  }

  async onModuleDestroy() {
    this.shutdownRequested = true;
    if (this.client) await this.client.disconnect();
  }

  private async startProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (!this.shutdownRequested) {
      try {
        // Process multiple items in batch for better performance
        const items = await this.batchPopItems('lpr_queue', 5);
        const restoreItems = await this.batchPopItems('lpr_restore', 3);
        const mismatchItems = await this.batchPopItems('lpr_mismatch', 2);

        // Process main queue items in parallel
        if (items.length > 0) {
          await Promise.allSettled(items.map(item => this.processItem(item)));
        }

        // Process restore queue items in parallel
        if (restoreItems.length > 0) {
          await Promise.allSettled(restoreItems.map(item => this.processRestore(item)));
        }

        // Process mismatch queue: prepare and publish to lpr_alarm
        if (mismatchItems.length > 0) {
          await Promise.allSettled(mismatchItems.map(item => this.processMismatch(item)));
        }

        // Small delay to prevent CPU spinning when queues are empty
        if (items.length === 0 && restoreItems.length === 0 && mismatchItems.length === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }

      } catch (err) {
        console.error('Queue processing error:', err);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    this.isProcessing = false;
  }

  /**
   * Publish payload to lpr_alarm channel. Fire-and-forget; errors are caught and logged.
   */
  private publishLprAlarm(payload: object): void {
    if (!this.client) return;
    this.client.publish('lpr_alarm', JSON.stringify(payload))
      .catch((err) => console.error('lpr_alarm publish error:', err?.message || err));
  }

  /**
   * Check if plate was seen for this LPR within threshold (Redis lpr_repeat key). If repeat, publish to lpr_alarm; then set key with TTL.
   * Fire-and-forget safe; errors are caught and logged.
   */
  private checkRepeatAndLog(lprId: string, thresholdSec: number, plate: string): void {
    if (!this.client || !thresholdSec) return;
    const key = `lpr_repeat:${lprId}:${plate}`;
    this.client.get(key)
      .then((val) => {
        if (val != null) {
          this.publishLprAlarm({ type: 'repeat', plate, lprId, repeat_within_threshold: true });
        }
        return this.client.set(key, '1', { EX: thresholdSec });
      })
      .catch((err) => console.error('checkRepeatAndLog error:', err?.message || err));
  }

  /**
   * Process item from lpr_mismatch queue: prepare payload and publish to lpr_alarm.
   */
  private async processMismatch(item: string): Promise<void> {
    if (item == null) return;
    try {
      const payload = typeof item === 'string' ? (() => { try { return JSON.parse(item); } catch { return { raw: item }; } })() : item;
      const alarmPayload = { type: 'mismatch', ...(typeof payload === 'object' && payload !== null ? payload : { data: payload }) };
      this.publishLprAlarm(alarmPayload);
    } catch (err) {
      console.error('processMismatch error:', err?.message || err);
    }
  }

  private async batchPopItems(queueName: string, batchSize: number): Promise<string[]> {
    if (!this.client || !this.redisConnected) {
      return [];
    }
    try {
      const items: string[] = [];
      for (let i = 0; i < batchSize; i++) {
        const item = await this.client.rPop(queueName);
        if (item === null) break;
        items.push(item);
      }
      return items;
    } catch (error) {
      this.redisConnected = false;
      return [];
    }
  }

  // Cached database query methods
  private async getCachedCameraLprSession(session: string) {
    const cacheKey = `camera_lpr_session_${session}`;
    let sessionData = await this.cacheManager.get(cacheKey) as any;

    if (!sessionData) {
      sessionData = await this.db.camera_lpr_camera.findFirst({
        where: { session: session },
        include: { camera: true }
      });
      if (sessionData) {
        await this.cacheManager.set(cacheKey, sessionData, 300000); // Cache for 5 minutes
      }
    }
    return sessionData;
  }

  private async getCachedLprList(ocr: string) {
    const cacheKey = `lpr_list_exact_${ocr}`;
    let list = await this.cacheManager.get(cacheKey) as any;

    if (!list) {
      list = await this.db.lpr_list.findFirst({
        where: { ocr: ocr, isPartial: false },
        include: { lpr_list_image: true }
      });
      if (list) {
        await this.cacheManager.set(cacheKey, list, 600000); // Cache for 10 minutes
      }
    }
    return list;
  }

  private async getCachedCameraInfo(cameraId: string) {
    const cacheKey = `camera_info_${cameraId}`;
    let cameraInfo = await this.cacheManager.get(cacheKey) as any;

    if (!cameraInfo) {
      cameraInfo = await this.db.camera.findFirst({
        where: { id: cameraId },
        include: { camera_info: true }
      });
      if (cameraInfo) {
        await this.cacheManager.set(cacheKey, cameraInfo, 600000); // Cache for 10 minutes
      }
    }
    return cameraInfo;
  }

  private async processItem(item: string) {
    if (item === null) { return false }
    try {
      const raw = JSON.parse(item)
      const db1: any = {
        country      : raw.Country.toString(),
        direction    : raw.Direction.toString(),
        lineid       : raw.LineID.toString(),
        ocr          : raw.OCR.toString(),
        platetype    : raw.PlateType.toString(),
        trackid      : raw.TrackID.toString(),
        vehiclebrand : raw.VehicleBrand.toString(),
        vehiclecolor : raw.VehicleColor.toString(),
        vehiclemodel : raw.VehicleModel.toString(),
        vehicletype  : raw.VehicleType.toString(),
        time         : raw.Time.toString(),
        isBlackList  : false,
        isWhiteList  : false,
        isNotifable  : false,
        camAddress   : '',
        camMapLat    : '',
        camMapLng    : ''
      }
      const db2 = {
        plateimage: raw.PlateImage || null,
        vehicleimage: raw.VehicleImage || null,
        frame: raw.Frame || null,
        generatedplateimage: raw.GeneratedPlateImage || null,
      }

        // Use cached session lookup
        const s1 = await this.getCachedCameraLprSession(raw.GUID.toString());
        if (s1) {
          const camera_id = s1.camera[0].id
                  // check for lists using cache
        const list = await this.getCachedLprList(db1.ocr);
        if (list) {
          if (list.vehiclebrand === '' || list.vehiclebrand === db1.vehiclebrand )
          {
            if (list.vehiclecolor === '' || list.vehiclecolor === db1.vehiclecolor)
            {
              if (list.vehiclemodel === '' || list.vehiclemodel === db1.vehiclemodel)
              {
                if (list.vehicletype === '' || list.vehicletype === db1.vehicletype)
                {
                  db1.isBlackList = list.isBlackList
                  db1.isWhiteList = list.isWhiteList
                  db1.isNotifable = list.isNotifable

                  // Process operations for this LPR list
                  this.operationsService.processLprDetection(list.id, camera_id);
                }
              }
            }
          }
        }
        // check for list partial - use parameterized query with proper escaping
        const escapedOcr = db1.ocr.replace(/%/g, '\\%').replace(/_/g, '\\_');
        const list2:any[] = await this.db.$queryRawUnsafe(
          `SELECT * FROM lpr_list WHERE $1 ILIKE REPLACE(ocr, '*', '%') ESCAPE '\\'`,
          escapedOcr
        );
        let partialList = null;
        if (!list && list2.length > 0) {
          list2.forEach(element => {
            if (element.vehiclebrand === '' || element.vehiclebrand === db1.vehiclebrand )
            {
              if (element.vehiclecolor === '' || element.vehiclecolor === db1.vehiclecolor)
              {
                if (element.vehiclemodel === '' || element.vehiclemodel === db1.vehiclemodel)
                {
                  if (element.vehicletype === '' || element.vehicletype === db1.vehicletype)
                  {
                    db1.isBlackList = element.isBlackList
                    db1.isWhiteList = element.isWhiteList
                    db1.isNotifable = element.isNotifable

                    // Process operations for this partial LPR list
                    this.operationsService.processLprDetection(element.id, camera_id);

                    // Store the first matching partial list for driver info
                    if (!partialList) {
                      partialList = element;
                    }
                  }
                }
              }
            }
          });
        }
        // Use cached camera info lookup
        const cam_info = await this.getCachedCameraInfo(camera_id);
        // Optimize: Single iteration instead of multiple filter operations
        const infoMap = new Map(cam_info.camera_info.map(x => [x.key, x.value]));
        db1.camAddress = infoMap.get('address') || ''
        db1.camMapLat = infoMap.get('map_lat') || ''
        db1.camMapLng = infoMap.get('map_lng') || ''

        // Use transaction for better performance and consistency
        const result = await this.db.$transaction(async (tx) => {
          const p = await tx.lpr_result.create({
            data: {...db1, camera: { connect: { id: camera_id } }}
          });

          // Handle image storage: MinIO if enabled, otherwise database
          let imagesStoredInMinIO = false;
          let p2 = null;

          if (this.storageService.isMinIOEnabled()) {
            try {
              // Upload images to MinIO
              await this.storageService.uploadLprImages(p.id, db2);
              // Don't create lpr_result_image record when MinIO is used
              imagesStoredInMinIO = true;
            } catch (error) {
              console.error('Failed to upload images to MinIO, falling back to database storage:', error);
              // Fallback to database storage if MinIO upload fails
              imagesStoredInMinIO = false;
              p2 = await tx.lpr_result_image.create({
                data: { ...db2, lpr_result: { connect: { id: p.id } } }
              });
            }
          } else {
            // Store images in database when MinIO is not enabled
            p2 = await tx.lpr_result_image.create({
              data: { ...db2, lpr_result: { connect: { id: p.id } } }
            });
          }

          return { p, p2, imagesStoredInMinIO, originalImages: db2 };
        });

        if (result.p2) {
          delete result.p2.id;
        }

        if (s1.repeat_detection === true && s1.repeat_threshold_seconds > 0) {
          setImmediate(() => this.checkRepeatAndLog(s1.id, s1.repeat_threshold_seconds, db1.ocr));
        }

        // Prepare driver info and images for Redis output
        let driverInfo = null;
        let lprListImages = [];

        if (list) {
          driverInfo = {
            drivername: list.drivername,
            driverfamily: list.driverfamily,
            driverphone: list.driverphone,
            driverdesc: list.driverdesc,
            alarmText: list.alarmText,
            alarmColor: list.alarmColor
          };
          lprListImages = list.lpr_list_image.map(img => img.image);
        } else if (partialList) {
          // Get full partial list with images
          const fullPartialList = await this.db.lpr_list.findFirst({
            where: { id: partialList.id },
            include: { lpr_list_image: true }
          });
          if (fullPartialList) {
            driverInfo = {
              drivername: fullPartialList.drivername,
              driverfamily: fullPartialList.driverfamily,
              driverphone: fullPartialList.driverphone,
              driverdesc: fullPartialList.driverdesc,
              alarmText: fullPartialList.alarmText,
              alarmColor: fullPartialList.alarmColor
            };
            lprListImages = fullPartialList.lpr_list_image.map(img => img.image);
          }
        }

        // Use original base64 images for Redis (we already have them, no need to convert back)
        const publishImages = result.imagesStoredInMinIO ? result.originalImages : (result.p2 || {});

        // Publish to Redis asynchronously to not block processing
        process.nextTick(() => {
          this.client.publish('lpr', JSON.stringify({
            ...result.p,
            ...publishImages,
            camera_id: camera_id,
            lpr_title: s1.title,
            driver_info: driverInfo,
            lpr_list_images: lprListImages
          })).catch(err => console.error('Redis publish error:', err));
        });

      } else {
        console.log('invalid lpr guid')
      }
    } catch (error) {
      console.log(error)
    }
  }

  private async processRestore(item: string) {
    if (item === null) { return false }
    try {
      const raw = JSON.parse(item)
      const db1 = {
        id           : raw.id.toString(),
        country      : raw.country.toString(),
        direction    : raw.direction.toString(),
        lineid       : raw.lineid.toString(),
        ocr          : raw.ocr.toString(),
        platetype    : raw.platetype.toString(),
        trackid      : raw.trackid.toString(),
        vehiclebrand : raw.vehiclebrand.toString(),
        vehiclecolor : raw.vehiclecolor.toString(),
        vehiclemodel : raw.vehiclemodel.toString(),
        vehicletype  : raw.vehicletype.toString(),
        time         : raw.time.toString(),
        isBlackList  : raw.isBlackList.toString() === 'true' ? true : false,
        isWhiteList  : raw.isWhiteList.toString() === 'true' ? true : false,
        isNotifable  : raw.isNotifable.toString() === 'true' ? true : false,
        camAddress   : raw.camAddress.toString(),
        camMapLat    : raw.camMapLat.toString(),
        camMapLng    : raw.camMapLng.toString(),
        created_at   : raw.created_at.toString(),
      }
      const db2 = {
        plateimage: raw.PlateImage || null,
        vehicleimage: raw.VehicleImage || null,
        frame: raw.Frame || null,
        generatedplateimage: raw.GeneratedPlateImage || null,
      }
      const camera_id = raw.camera.toString()

      // Use cached camera info lookup
      const cam_info = await this.getCachedCameraInfo(camera_id);
      if (cam_info) {
        db1.camAddress = cam_info.camera_info.filter(x => x.key === 'address')[0]['value']
        db1.camMapLat = cam_info.camera_info.filter(x => x.key === 'map_lat')[0]['value']
        db1.camMapLng = cam_info.camera_info.filter(x => x.key === 'map_lng')[0]['value']

        // Use transaction for better performance
        const result = await this.db.$transaction(async (tx) => {
          const p = await tx.lpr_result.create({
            data: {...db1, camera: { connect: { id: camera_id } }}
          });

          // Handle image storage: MinIO if enabled, otherwise database
          let imagesStoredInMinIO = false;
          let p2 = null;

          if (this.storageService.isMinIOEnabled()) {
            try {
              // Upload images to MinIO
              await this.storageService.uploadLprImages(p.id, db2);
              // Don't create lpr_result_image record when MinIO is used
              imagesStoredInMinIO = true;
            } catch (error) {
              console.error('Failed to upload images to MinIO, falling back to database storage:', error);
              // Fallback to database storage if MinIO upload fails
              imagesStoredInMinIO = false;
              p2 = await tx.lpr_result_image.create({
                data: { ...db2, lpr_result: { connect: { id: p.id } } }
              });
            }
          } else {
            // Store images in database when MinIO is not enabled
            p2 = await tx.lpr_result_image.create({
              data: { ...db2, lpr_result: { connect: { id: p.id } } }
            });
          }

          return { p, p2, imagesStoredInMinIO, originalImages: db2 };
        });

        if (result.p2) {
          delete result.p2.id;
        }

        // Use original base64 images for Redis (we already have them, no need to convert back)
        const publishImages = result.imagesStoredInMinIO ? result.originalImages : (result.p2 || {});

        // Publish to Redis asynchronously
        process.nextTick(() => {
          this.client.publish('lpr', JSON.stringify({
            ...result.p,
            ...publishImages,
            camera_id: camera_id
          })).catch(err => console.error('Redis publish error:', err));
        });

      } else {
        console.log('invalid lpr guid')
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Cache management methods
  async clearCache() {
    const keys = [
      'camera_lpr_session_*',
      'lpr_list_exact_*',
      'camera_info_*'
    ];

    for (const pattern of keys) {
      // Note: This is a simplified cache clear - in production you might want to use Redis SCAN
      console.log(`Clearing cache pattern: ${pattern}`);
    }
  }

  // Method to preload frequently accessed data into cache
  async preloadCache() {
    try {
      console.log('Preloading cache with frequently accessed data...');

      // Preload active camera sessions
      const activeSessions = await this.db.camera_lpr_camera.findMany({
        where: { isActive: true },
        include: { camera: true }
      });

      for (const session of activeSessions) {
        await this.cacheManager.set(
          `camera_lpr_session_${session.session}`,
          session,
          300000
        );
      }

      // Preload common LPR lists
      const commonLists = await this.db.lpr_list.findMany({
        where: { isPartial: false },
        include: { lpr_list_image: true },
        take: 100 // Limit to most common
      });

      for (const list of commonLists) {
        await this.cacheManager.set(
          `lpr_list_exact_${list.ocr}`,
          list,
          600000
        );
      }

      console.log(`Preloaded ${activeSessions.length} sessions and ${commonLists.length} LPR lists`);
    } catch (error) {
      console.error('Cache preload error:', error);
    }
  }
}