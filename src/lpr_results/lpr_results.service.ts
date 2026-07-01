import { HttpException, Injectable } from '@nestjs/common';
import * as dtos from './lpr_results.dtos';
import { DbService } from 'src/db/db.service';
import { StorageService } from 'src/storage/storage.service';
import { generalResponse } from 'src/app.consts';
import { buildUserPermissionWhere } from 'src/app.shared';
import { LoggerService } from 'src/logger/logger.service';

// TODO:
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import { createObjectCsvWriter } from 'csv-writer';
import { promises as fsPromises } from 'fs';

@Injectable()
export class LprResultsService {
  constructor(
    private db: DbService,
    private loggerService: LoggerService,
    private storageService: StorageService
  ) {}

  private async resolveAllowedCameraIds(user: any, cameraIds?: string): Promise<string[]> {
    const where: any = { AND: [] }
    if (user.isSuperAdmin !== true) {
      buildUserPermissionWhere(user, where)
      where.deleted = false
    }
    const cameras_q = await this.db.camera.findMany({ where, select: { id: true } })
    if (!cameras_q || cameras_q.length === 0) { throw { message: 'no camera found for this user' } }
    let cameras = cameras_q.map(x => x.id)
    const requestedIds: string[] = []
    if (cameraIds && cameraIds.trim() !== '') {
      requestedIds.push(...cameraIds.split(',').map(id => id.trim()).filter(Boolean))
    }
    if (requestedIds.length > 0) {
      const valid = requestedIds.filter(id => cameras.includes(id))
      if (valid.length === 0) {
        throw { message: 'camera not valid for this user' }
      }
      cameras = valid
    }
    return cameras
  }

  async findAll(user: any, query: dtos.lprSearchQuery): Promise<generalResponse> {
    try {
      // create where
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = Math.min(parseInt(query.pageSize), 100) // Max 100 records per page for performance
      const cameras = await this.resolveAllowedCameraIds(user, query.cameraIds)
      // fint lpr
      const conditions: any = { AND: [] }
      if (query.isBlackList) { conditions.isBlackList = query.isBlackList === 'false' ? false : true }
      if (query.isWhiteList) { conditions.isWhiteList = query.isWhiteList === 'false' ? false : true }
      if (query.isNotifable) { conditions.isNotifable = query.isNotifable === 'false' ? false : true }
      if (query.brand && query.brand !== '') { conditions.vehiclebrand = { contains: query.brand, mode: 'insensitive' } }
      if (query.color && query.color !== '') { conditions.vehiclecolor = { contains: query.color, mode: 'insensitive' } }
      if (query.model && query.model !== '') { conditions.vehiclemodel = { contains: query.model, mode: 'insensitive' } }
      if (query.type && query.type !== '') { conditions.vehicletype = { contains: query.type, mode: 'insensitive' } }
      if (query.plateType && query.plateType !== '') { conditions.platetype = { contains: query.plateType, mode: 'insensitive' } }
      if (query.address && query.address !== '') { conditions.camAddress = { contains: query.address, mode: 'insensitive' } }
      if (query.dateFrom && query.dateFrom !== '' && new Date(query.dateFrom)) { conditions['AND'].push({ created_at: { gte: new Date(query.dateFrom) } }) }
      if (query.dateTo && query.dateTo !== '' && new Date(query.dateTo)) { conditions['AND'].push({ created_at: { lte: new Date(query.dateTo) } }) }
      // query
      const [total, result] = await this.db.$transaction([
        this.db.lpr_result.count({ where: {
          ocr: { contains: query.search, mode: 'insensitive' },
          ...conditions,
          camera: { some: { id: { in: cameras } } }
        } }),
        this.db.lpr_result.findMany({ where: {
          ocr: { contains: query.search, mode: 'insensitive' },
          ...conditions,
          camera: { some: { id: { in: cameras } } }
        } , skip, take, orderBy: [{ created_at: 'desc' }], include: { lpr_result_image: true } })
      ])

      // If images are stored in MinIO (database has null), read from MinIO and convert to base64
      for (const record of result) {
        if (record.lpr_result_image && record.lpr_result_image.length > 0) {
          const imageData = record.lpr_result_image[0];
          // Check if images are null (stored in MinIO) or empty
          const needsMinIORead = !imageData.plateimage && !imageData.vehicleimage && !imageData.frame && !imageData.generatedplateimage;

          if (needsMinIORead && this.storageService.isMinIOEnabled()) {
            // Read images from MinIO and convert to base64
            const convertedImages = await this.storageService.convertLprImagesToBase64(record.id, {
              plateimage: imageData.plateimage,
              vehicleimage: imageData.vehicleimage,
              frame: imageData.frame,
              generatedplateimage: imageData.generatedplateimage,
            });
            record.lpr_result_image[0] = { ...imageData, ...convertedImages };
          }
          // If images are already in database as base64, use as-is (no conversion needed)
        }
      }

      const response: generalResponse = { status: true, data: { total, result }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async findOne(user: any, id: string): Promise<generalResponse> {
    try {
      // prepare where
      const where: any = { AND: [] } //
      // check if user is limited
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
        where.deleted = false
      }
      // db include
      const include = {}
      // get cameras
      const cameras = await this.db.camera.findMany({ where , include });
      if (!cameras) { throw { message: 'no camera found for this user' } }
      // fint lpr
      const s = await this.db.lpr_result.findFirst({ where: { id: id, camera: { some: { id: { in: cameras.map(x => { return x.id }) } } } }, include: { lpr_result_image: true }})
      if (!s) { throw { message: 'no record found' } }

      // If no lpr_result_image record exists (stored in MinIO), read from MinIO and convert to base64
      if (!s.lpr_result_image || s.lpr_result_image.length === 0) {
        if (this.storageService.isMinIOEnabled()) {
          // Read images from MinIO and convert to base64
          const convertedImages = await this.storageService.convertLprImagesToBase64(s.id, {
            plateimage: null,
            vehicleimage: null,
            frame: null,
            generatedplateimage: null,
          });
          // Create a virtual image object for response
          s.lpr_result_image = [convertedImages as any];
        }
      } else {
        // If images are stored in MinIO (database has null), read from MinIO and convert to base64
        const imageData = s.lpr_result_image[0];
        // Check if images are null (stored in MinIO) or empty
        const needsMinIORead = !imageData.plateimage && !imageData.vehicleimage && !imageData.frame && !imageData.generatedplateimage;

        if (needsMinIORead && this.storageService.isMinIOEnabled()) {
          // Read images from MinIO and convert to base64
          const convertedImages = await this.storageService.convertLprImagesToBase64(s.id, {
            plateimage: imageData.plateimage,
            vehicleimage: imageData.vehicleimage,
            frame: imageData.frame,
            generatedplateimage: imageData.generatedplateimage,
          });
          // Update the image data with base64
          s.lpr_result_image[0] = { ...imageData, ...convertedImages };
        }
        // If images are already in database as base64, use as-is (no conversion needed)
      }

      const response: generalResponse = { status: true, data: s, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putOne(user: any, id: string, data: dtos.lprUpdateItem): Promise<generalResponse> {
    try {
      // prepare where
      const where: any = { AND: [] } //
      // check if user is limited
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
        where.deleted = false
      }
      // db include
      const include = {}
      // get cameras
      const cameras = await this.db.camera.findMany({ where , include });
      if (!cameras) { throw { message: 'no camera found for this user' } }
      // fint lpr
      const s = await this.db.lpr_result.findFirst({ where: { id: id, camera: { some: { id: { in: cameras.map(x => { return x.id }) } } } } })
      if (!s) { throw { message: 'no record found' } }

      // Store before state for logging
      const before = {
        ocr: s.ocr,
        vehiclebrand: s.vehiclebrand,
        vehiclecolor: s.vehiclecolor,
        vehicletype: s.vehicletype,
        vehiclemodel: s.vehiclemodel
      };

      await this.db.lpr_result.update({ where: { id: id }, data: { ocr: data.plate, vehiclebrand: data.brand, vehiclecolor: data.color, vehicletype: data.type, vehiclemodel: data.model } })
      const ss = await this.db.lpr_result.findFirst({ where: { id: id, camera: { some: { id: { in: cameras.map(x => { return x.id }) } } } }, include: { lpr_result_image: true, camera: { select: { id: true } } }})

      // Store after state for logging
      const after = {
        ocr: ss.ocr,
        vehiclebrand: ss.vehiclebrand,
        vehiclecolor: ss.vehiclecolor,
        vehicletype: ss.vehicletype,
        vehiclemodel: ss.vehiclemodel
      };

      // Build log message with before/after changes
      const changes = [];
      if (before.ocr !== after.ocr) { changes.push(`OCR: "${before.ocr}" → "${after.ocr}"`); }
      if (before.vehiclebrand !== after.vehiclebrand) { changes.push(`Brand: "${before.vehiclebrand}" → "${after.vehiclebrand}"`); }
      if (before.vehiclecolor !== after.vehiclecolor) { changes.push(`Color: "${before.vehiclecolor}" → "${after.vehiclecolor}"`); }
      if (before.vehicletype !== after.vehicletype) { changes.push(`Type: "${before.vehicletype}" → "${after.vehicletype}"`); }
      if (before.vehiclemodel !== after.vehiclemodel) { changes.push(`Model: "${before.vehiclemodel}" → "${after.vehiclemodel}"`); }
      const logMessage = changes.length > 0
        ? `LPR result updated (ID: ${id}): ${changes.join(', ')}`
        : `LPR result updated (ID: ${id}): No changes detected`;
      // Get camera ID for logging
      const cameraId = ss.camera && ss.camera.length > 0 ? ss.camera[0].id : null;
      this.loggerService.log(logMessage, 0, user, null, null, cameraId, null);

      const response: generalResponse = { status: true, data: ss, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getTypes(user: any): Promise<generalResponse> {
    try {
      const d = await this.db.lpr_result.findMany({ select: { vehicletype: true }, distinct: ['vehicletype'] })
      const response: generalResponse = { status: true, data: d, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getBrands(user: any): Promise<generalResponse> {
    try {
      const d = await this.db.lpr_result.findMany({ select: { vehiclebrand: true }, distinct: ['vehiclebrand'] })
      const response: generalResponse = { status: true, data: d, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getColors(user: any): Promise<generalResponse> {
    try {
      const d = await this.db.lpr_result.findMany({ select: { vehiclecolor: true }, distinct: ['vehiclecolor'] })
      const response: generalResponse = { status: true, data: d, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getModels(user: any): Promise<generalResponse> {
    try {
      const d = await this.db.lpr_result.findMany({ select: { vehiclemodel: true }, distinct: ['vehiclemodel'] })
      const response: generalResponse = { status: true, data: d, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getClearAll(user: any): Promise<generalResponse> {
    try {
      // delete MinIO objects before removing DB rows
      if (this.storageService.isMinIOEnabled()) {
        const allRecords = await this.db.lpr_result.findMany({ select: { id: true } })
        await Promise.allSettled(allRecords.map(r => this.storageService.deleteLprImages(r.id)))
      }
      await this.db.lpr_result_image.deleteMany({})
      await this.db.lpr_result.deleteMany({})
      const response: generalResponse = { status: true, data: null, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async reportHourly(user: any, query: dtos.lprReportQuery): Promise<generalResponse> {
    try {
      const cameras = await this.resolveAllowedCameraIds(user, query.cameraIds)
      // fint lpr
      const conditions: any = { AND: [] }
      if (query.isBlackList) { conditions.isBlackList = query.isBlackList === 'false' ? false : true }
      if (query.isWhiteList) { conditions.isWhiteList = query.isWhiteList === 'false' ? false : true }
      if (query.isNotifable) { conditions.isNotifable = query.isNotifable === 'false' ? false : true }
      if (query.brand && query.brand !== '') { conditions.vehiclebrand = { contains: query.brand, mode: 'insensitive' } }
      if (query.color && query.color !== '') { conditions.vehiclecolor = { contains: query.color, mode: 'insensitive' } }
      if (query.model && query.model !== '') { conditions.vehiclemodel = { contains: query.model, mode: 'insensitive' } }
      if (query.type && query.type !== '') { conditions.vehicletype = { contains: query.type, mode: 'insensitive' } }
      if (query.address && query.address !== '') { conditions.camAddress = { contains: query.address, mode: 'insensitive' } }
      if (query.dateFrom && query.dateFrom !== '' && new Date(query.dateFrom)) { conditions['AND'].push({ created_at: { gte: new Date(query.dateFrom) } }) }
      if (query.dateTo && query.dateTo !== '' && new Date(query.dateTo)) { conditions['AND'].push({ created_at: { lte: new Date(query.dateTo) } }) }
      // query
      const results_temp = await this.db.lpr_result.findMany({ where: {
          ocr: { contains: query.search, mode: 'insensitive' },
          ...conditions,
          camera: { some: { id: { in: cameras } } }
        } , orderBy: [{ created_at: 'desc' }] })

      const hourlyCounts: { [key: number]: number } = {};
      for (let i = 0; i < 24; i++) hourlyCounts[i] = 0;
      for (const record of results_temp) {
        const hour = new Date(record.created_at).getHours();
        hourlyCounts[hour]++;
      }

      const result = Object.entries(hourlyCounts).map(([hour, count]) => ({
        hour: Number(hour),
        count,
      }));

      const response: generalResponse = { status: true, data: result, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async reportWeekDay(user: any, query: dtos.lprReportQuery): Promise<generalResponse> {
    try {
      const cameras = await this.resolveAllowedCameraIds(user, query.cameraIds)
      // fint lpr
      const conditions: any = { AND: [] }
      if (query.isBlackList) { conditions.isBlackList = query.isBlackList === 'false' ? false : true }
      if (query.isWhiteList) { conditions.isWhiteList = query.isWhiteList === 'false' ? false : true }
      if (query.isNotifable) { conditions.isNotifable = query.isNotifable === 'false' ? false : true }
      if (query.brand && query.brand !== '') { conditions.vehiclebrand = { contains: query.brand, mode: 'insensitive' } }
      if (query.color && query.color !== '') { conditions.vehiclecolor = { contains: query.color, mode: 'insensitive' } }
      if (query.model && query.model !== '') { conditions.vehiclemodel = { contains: query.model, mode: 'insensitive' } }
      if (query.type && query.type !== '') { conditions.vehicletype = { contains: query.type, mode: 'insensitive' } }
      if (query.address && query.address !== '') { conditions.camAddress = { contains: query.address, mode: 'insensitive' } }
      if (query.dateFrom && query.dateFrom !== '' && new Date(query.dateFrom)) { conditions['AND'].push({ created_at: { gte: new Date(query.dateFrom) } }) }
      if (query.dateTo && query.dateTo !== '' && new Date(query.dateTo)) { conditions['AND'].push({ created_at: { lte: new Date(query.dateTo) } }) }
      // query
      const results_temp = await this.db.lpr_result.findMany({ where: {
          ocr: { contains: query.search, mode: 'insensitive' },
          ...conditions,
          camera: { some: { id: { in: cameras } } }
        } , orderBy: [{ created_at: 'desc' }] })

      const dailyCounts: { [key: number]: number } = {};
      for (let i = 0; i < 7; i++) dailyCounts[i] = 0;

      for (const record of results_temp) {
        const day = new Date(record.created_at).getDay(); // 0 = Sunday
        dailyCounts[day]++;
      }

      const result = Object.entries(dailyCounts).map(([day, count]) => ({
        day: Number(day),
        count,
      }));

      const response: generalResponse = { status: true, data: result, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async reportMonthDay(user: any, query: dtos.lprReportQuery): Promise<generalResponse> {
    try {
      const cameras = await this.resolveAllowedCameraIds(user, query.cameraIds)
      // fint lpr
      const conditions: any = { AND: [] }
      if (query.isBlackList) { conditions.isBlackList = query.isBlackList === 'false' ? false : true }
      if (query.isWhiteList) { conditions.isWhiteList = query.isWhiteList === 'false' ? false : true }
      if (query.isNotifable) { conditions.isNotifable = query.isNotifable === 'false' ? false : true }
      if (query.brand && query.brand !== '') { conditions.vehiclebrand = { contains: query.brand, mode: 'insensitive' } }
      if (query.color && query.color !== '') { conditions.vehiclecolor = { contains: query.color, mode: 'insensitive' } }
      if (query.model && query.model !== '') { conditions.vehiclemodel = { contains: query.model, mode: 'insensitive' } }
      if (query.type && query.type !== '') { conditions.vehicletype = { contains: query.type, mode: 'insensitive' } }
      if (query.address && query.address !== '') { conditions.camAddress = { contains: query.address, mode: 'insensitive' } }
      if (query.dateFrom && query.dateFrom !== '' && new Date(query.dateFrom)) { conditions['AND'].push({ created_at: { gte: new Date(query.dateFrom) } }) }
      if (query.dateTo && query.dateTo !== '' && new Date(query.dateTo)) { conditions['AND'].push({ created_at: { lte: new Date(query.dateTo) } }) }
      // query
      const results_temp = await this.db.lpr_result.findMany({ where: {
          ocr: { contains: query.search, mode: 'insensitive' },
          ...conditions,
          camera: { some: { id: { in: cameras } } }
        } , orderBy: [{ created_at: 'desc' }] })

      const dailyCounts: { [key: number]: number } = {};
      for (let i = 1; i <= 31; i++) dailyCounts[i] = 0;

      for (const record of results_temp) {
        const day = new Date(record.created_at).getDate(); // 1 to 31
        dailyCounts[day]++;
      }

      const result = Object.entries(dailyCounts).map(([day, count]) => ({
        day: Number(day),
        count,
      }));
      const response: generalResponse = { status: true, data: result, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }




  async export(user: any, query: dtos.lprExportQuery): Promise<generalResponse> {
    try {
      // create where
      const where: any = { AND: [] } //
      // check if user is limited
      if (user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
        where.deleted = false
      }
      // get cameras
      const cameras = await this.db.camera.findMany({ where });
      if (!cameras) { throw { message: 'no camera found for this user' } }
      // fint lpr
      const conditions: any = { AND: [] }
      if (query.isBlackList) { conditions.isBlackList = query.isBlackList === 'false' ? false : true }
      if (query.isWhiteList) { conditions.isWhiteList = query.isWhiteList === 'false' ? false : true }
      if (query.isNotifable) { conditions.isNotifable = query.isNotifable === 'false' ? false : true }
      if (query.brand && query.brand !== '') { conditions.vehiclebrand = { contains: query.brand, mode: 'insensitive' } }
      if (query.color && query.color !== '') { conditions.vehiclecolor = { contains: query.color, mode: 'insensitive' } }
      if (query.model && query.model !== '') { conditions.vehiclemodel = { contains: query.model, mode: 'insensitive' } }
      if (query.type && query.type !== '') { conditions.vehicletype = { contains: query.type, mode: 'insensitive' } }
      if (query.address && query.address !== '') { conditions.camAddress = { contains: query.address, mode: 'insensitive' } }
      if (query.dateFrom && query.dateFrom !== '' && new Date(query.dateFrom)) { conditions['AND'].push({ created_at: { gte: new Date(query.dateFrom) } }) }
      if (query.dateTo && query.dateTo !== '' && new Date(query.dateTo)) { conditions['AND'].push({ created_at: { lte: new Date(query.dateTo) } }) }
      // query
      let take_param: any = {}
      if (query.limit && parseInt(query.limit).toString() === query.limit && parseInt(query.limit) > 0) {
        take_param.take = parseInt(query.limit)
      }
      const result = await this.db.lpr_result.findMany({ where: {
          ocr: { contains: query.search, mode: 'insensitive' },
          ...conditions,
          camera: { some: { id: { in: cameras.map(x => { return x.id }) } } }
        } , include: { camera: true } , orderBy: [{ created_at: 'desc' }], ...take_param })

      const exportRoot = path.join(__dirname, '..', '..', 'exports');
      const timestamp = Date.now().toString();
      const exportDir = path.join(exportRoot, `export_${timestamp}`);
      await fsPromises.mkdir(exportDir, { recursive: true });
      // CSV Writer Setup
      const csvWriter = createObjectCsvWriter({
        path: path.join(exportDir, `data.csv`),
        header: [
          { id: 'id', title: 'id' },
          { id: 'country', title: 'country' },
          { id: 'direction', title: 'direction' },
          { id: 'lineid', title: 'lineid' },
          { id: 'ocr', title: 'ocr' },
          { id: 'platetype', title: 'platetype' },
          { id: 'trackid', title: 'trackid' },
          { id: 'vehiclebrand', title: 'vehiclebrand' },
          { id: 'vehiclecolor', title: 'vehiclecolor' },
          { id: 'vehiclemodel', title: 'vehiclemodel' },
          { id: 'vehicletype', title: 'vehicletype' },
          { id: 'time', title: 'time' },
          { id: 'isBlackList', title: 'isBlackList' },
          { id: 'isWhiteList', title: 'isWhiteList' },
          { id: 'isNotifable', title: 'isNotifable' },
          { id: 'camAddress', title: 'camAddress' },
          { id: 'camMapLat', title: 'camMapLat' },
          { id: 'camMapLng', title: 'camMapLng' },
          { id: 'created_at', title: 'created_at' },
          { id: 'camera', title: 'camera' },
        ],
      });
      await csvWriter.writeRecords(result.map(r => ({
        id: r.id,
        country: r.country,
        direction: r.direction,
        lineid: r.lineid,
        ocr: r.ocr,
        platetype: r.platetype,
        trackid: r.trackid,
        vehiclebrand: r.vehiclebrand,
        vehiclecolor: r.vehiclecolor,
        vehiclemodel: r.vehiclemodel,
        vehicletype: r.vehicletype,
        time: r.time,
        isBlackList: r.isBlackList,
        isWhiteList: r.isWhiteList,
        isNotifable: r.isNotifable,
        camAddress: r.camAddress,
        camMapLat: r.camMapLat,
        camMapLng: r.camMapLng,
        created_at: r.created_at,
        camera: r['camera'][0].id,
      })));
      // Save all images in each record folder
      await (async ()=>{
        for (const record of result) {
          const recordDir = path.join(exportDir, record.id);
          await fsPromises.mkdir(recordDir, { recursive: true });
          const images_list = await this.db.lpr_result_image.findFirst({ where: { lpr_result: { some: { id: record.id } } } })

          // If no lpr_result_image record exists (stored in MinIO), read from MinIO and convert to base64
          let convertedImages: any;

          if (!images_list) {
            // No record exists, images are in MinIO
            if (this.storageService.isMinIOEnabled()) {
              convertedImages = await this.storageService.convertLprImagesToBase64(record.id, {
                plateimage: null,
                vehicleimage: null,
                frame: null,
                generatedplateimage: null,
              });
            } else {
              convertedImages = {
                plateimage: null,
                vehicleimage: null,
                frame: null,
                generatedplateimage: null,
              };
            }
          } else {
            // Record exists, check if images are null (stored in MinIO) or empty
            convertedImages = {
              plateimage: images_list.plateimage || null,
              vehicleimage: images_list.vehicleimage || null,
              frame: images_list.frame || null,
              generatedplateimage: images_list.generatedplateimage || null,
            };

            const needsMinIORead = !convertedImages.plateimage && !convertedImages.vehicleimage && !convertedImages.frame && !convertedImages.generatedplateimage;

            if (needsMinIORead && this.storageService.isMinIOEnabled()) {
              // Read images from MinIO and convert to base64
              convertedImages = await this.storageService.convertLprImagesToBase64(record.id, {
                plateimage: convertedImages.plateimage,
                vehicleimage: convertedImages.vehicleimage,
                frame: convertedImages.frame,
                generatedplateimage: convertedImages.generatedplateimage,
              });
            }
          }

          const images = [
            { name: `plateimage.jpg`, data: convertedImages.plateimage },
            { name: `vehicleimage.jpg`, data: convertedImages.vehicleimage },
            { name: `frame.jpg`, data: convertedImages.frame },
            { name: `generatedplateimage.jpg`, data: convertedImages.generatedplateimage },
          ];
          for (const image of images) {
            if (image.data) {
              const buffer = Buffer.from(image.data, 'base64');
              await fsPromises.writeFile(path.join(recordDir, image.name), buffer);
            }
          }
        }
      })()
      // Create zip file
      const zipFilePath = path.join(exportRoot, `lpr_export_${timestamp}.zip`);
      await this.arch(exportDir, zipFilePath)
      // Delete original export directory
      await fsPromises.rm(exportDir, { recursive: true, force: true });
      // delete records from db
      if (query.deleteFromDatabase === 'true')
      {
        // collect IDs before deleting so MinIO objects can be cleaned up
        const toDelete = await this.db.lpr_result.findMany({ where: {
            ocr: { contains: query.search, mode: 'insensitive' },
            ...conditions,
            camera: { some: { id: { in: cameras.map(x => { return x.id }) } } }
          }, select: { id: true } })

        // delete MinIO objects for each record
        if (this.storageService.isMinIOEnabled()) {
          await Promise.allSettled(toDelete.map(r => this.storageService.deleteLprImages(r.id)))
        }

        await this.db.lpr_result.deleteMany({ where: {
            ocr: { contains: query.search, mode: 'insensitive' },
            ...conditions,
            camera: { some: { id: { in: cameras.map(x => { return x.id }) } } }
          }})
        await this.db.lpr_result_image.deleteMany({ where: { lpr_result: { none: {} } } })
      }

      const response: generalResponse = { status: true, data: zipFilePath, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async arch (exportDir, zipFilePath) {
    return new Promise((resolvee, rejecte) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', () => { resolvee(true) });
      archive.on('error', () => { rejecte });
      archive.pipe(output);
      archive.directory(exportDir, false); // add entire export folder contents
      archive.finalize();
    });
  }

}
