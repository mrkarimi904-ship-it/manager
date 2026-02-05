import { ConflictException, HttpException, Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as dtos from './lpr.dto';
import { generalResponse } from 'src/app.consts';
import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';
import { StreamService } from 'src/stream/stream.service';
import { LicenseService } from 'src/license/license.service';

import * as Jimp from 'jimp';
// import * as fs from 'fs';

@Injectable()
export class LprService {
  constructor(
    private db: DbService,
    private readonly axios: HttpService,
    private stream: StreamService,
    private licenseService: LicenseService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /** ONVIF service base URL without trailing slash (same as onvif.service proxy). */
  private getOnvifBase(): string {
    return (process.env.ONVIF_SERVICE || '').replace(/\/$/, '');
  }

  async findAll(user: any, camera_id: string): Promise<generalResponse> {
    try {
      // check if camera available
      const where: any = { id: camera_id, AND: [] }
      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
        where.deleted = false
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_lpr_camera.findMany({ where: { camera: { some: { id: camera_id } } }, orderBy: { id: 'desc' } })
      return { status: true, data: list, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async findOne(user: any, camera_id: string, lpr_id: string): Promise<generalResponse> {
    try {
      // check if camera available
      const where: any = { id: camera_id, AND: [] }
      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
        where.deleted = false
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_lpr_camera.findUnique({ where: { id: lpr_id, camera: { some: { id: camera_id } } }, include: { camera_lpr: true } })
      if (!list) { throw new ConflictException() }

      return { status: true, data: list, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async create(user: any, camera_id: string, body: dtos.CreateLprDto): Promise<generalResponse> {
    try {
      // check if camera available
      const where = { id: camera_id, deleted: false, AND: [] }
      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const lpr = await this.db.camera_lpr.findFirst({ where: { id: body.lpr_id } })
      if (!lpr) { throw new ConflictException() }

      const new_body = {
        title: body.title,
        processType: body.processType,
        country: body.country,
        useROI: body.useROI,
        usePlateAlignment: body.usePlateAlignment,
        mustMatchPattern: body.mustMatchPattern,
        useGPU: body.useGPU,
        maxFPS: body.maxFPS,
        useDetection: body.useDetection,
        detectionConfidenceTh: body.detectionConfidenceTh,
        segmentationConfidenceTh: body.segmentationConfidenceTh,
        ocrConfidenceTh: body.ocrConfidenceTh,
        alprConfidenceTh: body.alprConfidenceTh,
        postProcessConfidenceTh: body.postProcessConfidenceTh,
        postProcessSkipLevelTh: body.postProcessSkipLevelTh,
        processStopLevelTh: body.processStopLevelTh,
        maxSuccessfulAnalysisCount: body.maxSuccessfulAnalysisCount,
        maxAnalysisCount: body.maxAnalysisCount,
        minPlateWidth: body.minPlateWidth,
        min2AnalysisInterval: body.min2AnalysisInterval,
        useTypeAndModelRecognition: body.useTypeAndModelRecognition,
        typeModelRecognitionSkipLevelTh: body.typeModelRecognitionSkipLevelTh,
        typeModelRecognitionStopLevelTh: body.typeModelRecognitionStopLevelTh,
        useColorRecognition: body.useColorRecognition,
        colorRecognitionSkipLevelTh: body.colorRecognitionSkipLevelTh,
        colorRecognitionStopLevelTh: body.colorRecognitionStopLevelTh,
        trackingDistanceTh: body.trackingDistanceTh,
        trackingInactiveTh: body.trackingInactiveTh,
        trackingActiveTh: body.trackingActiveTh,
        tickCount: body.tickCount,
        repeat_detection: body.repeat_detection ?? false,
        repeat_threshold_seconds: body.repeat_threshold_seconds ?? 0
      }

      const res = await this.db.camera_lpr_camera.create({ data: { ...new_body, camera: { connect: { id: camera_id } }, camera_lpr: { connect: { id: lpr.id } } } })

      return { status: true, data: res, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async update(user: any, camera_id: string, lpr_id: string, body: dtos.UpdateLprDto): Promise<generalResponse> {
    try {
      // check it lpr is not running
      const list = await this.db.camera_lpr_camera.findUnique({ where: { id: lpr_id, camera: { some: { id: camera_id } } }, include: { camera_lpr: true } })
      if (!list) { throw new ConflictException() }
      if (list.status === 'RUNNING' || list.status === 'PENDING' || list.status === 'STARTING') { throw new ConflictException('Stop lpr before editing') }

      // check if camera available
      const where = { id: camera_id, deleted: false, AND: [] }
      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      if (!list.camera_lpr) { throw new ConflictException() }

      const new_body = {
        title: body.title,
        processType: body.processType,
        country: body.country,
        useROI: body.useROI,
        usePlateAlignment: body.usePlateAlignment,
        mustMatchPattern: body.mustMatchPattern,
        useGPU: body.useGPU,
        maxFPS: body.maxFPS,
        useDetection: body.useDetection,
        detectionConfidenceTh: body.detectionConfidenceTh,
        segmentationConfidenceTh: body.segmentationConfidenceTh,
        ocrConfidenceTh: body.ocrConfidenceTh,
        alprConfidenceTh: body.alprConfidenceTh,
        postProcessConfidenceTh: body.postProcessConfidenceTh,
        postProcessSkipLevelTh: body.postProcessSkipLevelTh,
        processStopLevelTh: body.processStopLevelTh,
        maxSuccessfulAnalysisCount: body.maxSuccessfulAnalysisCount,
        maxAnalysisCount: body.maxAnalysisCount,
        minPlateWidth: body.minPlateWidth,
        min2AnalysisInterval: body.min2AnalysisInterval,
        useTypeAndModelRecognition: body.useTypeAndModelRecognition,
        typeModelRecognitionSkipLevelTh: body.typeModelRecognitionSkipLevelTh,
        typeModelRecognitionStopLevelTh: body.typeModelRecognitionStopLevelTh,
        useColorRecognition: body.useColorRecognition,
        colorRecognitionSkipLevelTh: body.colorRecognitionSkipLevelTh,
        colorRecognitionStopLevelTh: body.colorRecognitionStopLevelTh,
        trackingDistanceTh: body.trackingDistanceTh,
        trackingInactiveTh: body.trackingInactiveTh,
        trackingActiveTh: body.trackingActiveTh,
        tickCount: body.tickCount,
        repeat_detection: body.repeat_detection ?? false,
        repeat_threshold_seconds: body.repeat_threshold_seconds ?? 0
      }

      const res = await this.db.camera_lpr_camera.update({ where: { id: lpr_id}, data: { ...new_body } })

      await this.cacheManager.del(`camera_lpr_session_${lpr_id}`)

      return { status: true, data: res, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async remove(user: any, camera_id: string, lpr_id: string): Promise<generalResponse> {
    try {
      // check if camera available
      const where: any = { id: camera_id, AND: [] }
      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
        where.deleted = false
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_lpr_camera.findUnique({ where: { id: lpr_id, camera: { some: { id: camera_id } } }, include: { camera_lpr: true } })
      if (!list) { throw new ConflictException() }

      await this.stop(user, camera_id, lpr_id)

      await this.db.camera_lpr_camera.delete({ where: { id: list.id } })

      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async start(user: any, camera_id: string, lpr_id: string): Promise<generalResponse> {
    try {
      // check if camera available
      const where: any = { id: camera_id, deleted: false, AND: [] }
      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_lpr_camera.findUnique({ where: { id: lpr_id, camera: { some: { id: camera_id } } }, include: { camera_lpr: true } })
      if (!list) { throw new ConflictException() }

      if (list.status === 'RUNNING') { return { status: true, data: list, error: null, msg: null } }
      if (list.status === 'PENDING' || list.status === 'STARTING') { throw new ConflictException('Cannot start LPR while it is starting') }

      // check license for active LPR count limit (exclude current LPR so restart after manager_improved restart does not hit limit)
      if (await this.licenseService.can_add_new_lpr(lpr_id) === false) { throw { message: 'License limit: active LPR limit reached' }; }

      const url = list.camera_lpr[0].url
      const port = list.camera_lpr[0].port
      const prepare = `http://${url}:${port}/lpr_service`
      try {
        const results = await this.axios.axiosRef.get(prepare)
        const result = results.data.data.filter(x => x.lpr_id === list.id)
        if (result.length > 0) {
          const externalStatus = result[0].lpr_status
          await this.db.camera_lpr_camera.update({ where: { id: list.id }, data: { status: externalStatus, isActive: true, session: list.id } })
        } else {
          const cam_stream = await this.stream.start(user, { cameraId: camera_id, type: "HIGH" })
          const streamPort = cam_stream.data['port']
          const serv = cam_stream.data['cameraService']
          const cdata = {
            "id": list.id,
            "ip": serv.url,
            "port": streamPort,
            "redis_q": "lpr_queue",
            "roi": list.roi ? list.roi : '',
            "config": {
              "processType": list.processType,
              "country": list.country,
              "useROI": list.useROI,
              "usePlateAlignment": list.usePlateAlignment,
              "mustMatchPattern": list.mustMatchPattern,
              "useGPU": list.useGPU,
              "maxFPS": list.maxFPS,
              "useDetection": list.useDetection,
              "detectionConfidenceTh": list.detectionConfidenceTh,
              "segmentationConfidenceTh":list.segmentationConfidenceTh,
              "ocrConfidenceTh": list.ocrConfidenceTh,
              "alprConfidenceTh": list.alprConfidenceTh,
              "postProcessConfidenceTh": list.postProcessConfidenceTh,
              "postProcessSkipLevelTh": list.postProcessSkipLevelTh,
              "processStopLevelTh": list.processStopLevelTh,
              "maxSuccessfulAnalysisCount": list.maxSuccessfulAnalysisCount,
              "maxAnalysisCount": list.maxAnalysisCount,
              "minPlateWidth": list.minPlateWidth,
              "min2AnalysisInterval": list.min2AnalysisInterval,
              "useTypeAndModelRecognition": list.useTypeAndModelRecognition,
              "typeModelRecognitionSkipLevelTh": list.typeModelRecognitionSkipLevelTh,
              "typeModelRecognitionStopLevelTh": list.typeModelRecognitionStopLevelTh,
              "useColorRecognition": list.useColorRecognition,
              "colorRecognitionSkipLevelTh": list.colorRecognitionSkipLevelTh,
              "colorRecognitionStopLevelTh": list.colorRecognitionStopLevelTh,
              "trackingDistanceTh": list.trackingDistanceTh,
              "trackingInactiveTh": list.trackingInactiveTh,
              "trackingActiveTh": list.trackingActiveTh,
              "tickCount": list.tickCount
            }
          }
          const cr = await this.axios.axiosRef.post(prepare, cdata, { timeout: 2 * 60 * 1000 })
          const externalStatus = cr.data.lpr_status || 'PENDING'
          await this.db.camera_lpr_camera.update({ where: { id: list.id }, data: { status: externalStatus, isActive: true, session: list.id } })
        }
      } catch (error) {
        if (error.response && error.response.status >= 500) {
          throw new HttpException({ status: false, data: null, error: 'LPR service unavailable', msg: 'LPR service unavailable' }, 503)
        }
        throw error
      }

      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async stop(user: any, camera_id: string, lpr_id: string): Promise<generalResponse> {
    try {
      // check if camera available
      const where: any = { id: camera_id, AND: [] }
      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
        where.deleted = false
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_lpr_camera.findUnique({ where: { id: lpr_id, camera: { some: { id: camera_id } } }, include: { camera_lpr: true } })
      if (!list) { throw new ConflictException() }

      if (list.status === 'STOPPED') { return { status: true, data: list, error: null, msg: null } }
      if (list.status === 'STARTING') { throw new ConflictException('Cannot stop LPR while it is starting') }

      const url = list.camera_lpr[0].url
      const port = list.camera_lpr[0].port
      const prepare = `http://${url}:${port}/lpr_service`
      try {
        const results = await this.axios.axiosRef.get(prepare)
        const result = results.data.data.filter(x => x.lpr_id === list.id)

        if (result.length > 0) {
          const cdata = { id: list.id }
          try {
            const cr = await this.axios.axiosRef.post(prepare + '/stop', cdata)
            if (cr.data.status === 'ok' || cr.data.code === 201) {
              await this.db.camera_lpr_camera.update({ where: { id: list.id }, data: { status: 'STOPPED', isActive: false, session: '' } })
            } else {
              throw new HttpException({ status: false, data: null, error: 'Failed to stop LPR', msg: 'Failed to stop LPR' }, cr.data.code || 500)
            }
          } catch (error) {
            if (error.response && error.response.data) {
              const errorData = error.response.data
              if (errorData.code === 404) {
                await this.db.camera_lpr_camera.update({ where: { id: list.id }, data: { status: 'STOPPED', isActive: false, session: '' } })
              } else if (errorData.code === 409) {
                throw new HttpException({ status: false, data: null, error: 'LPR instance is busy', msg: 'LPR instance is busy' }, 409)
              } else if (errorData.code >= 500 || error.response.status >= 500) {
                throw new HttpException({ status: false, data: null, error: 'LPR service unavailable', msg: 'LPR service unavailable' }, 503)
              } else {
                throw new HttpException({ status: false, data: null, error: 'Failed to stop LPR', msg: 'Failed to stop LPR' }, errorData.code || 500)
              }
            } else if (error.response && error.response.status >= 500) {
              throw new HttpException({ status: false, data: null, error: 'LPR service unavailable', msg: 'LPR service unavailable' }, 503)
            } else {
              throw error
            }
          }
        } else {
          await this.db.camera_lpr_camera.update({ where: { id: list.id }, data: { status: 'STOPPED', isActive: false, session: '' } })
        }
      } catch (error) {
        if (error.response && error.response.status >= 500) {
          throw new HttpException({ status: false, data: null, error: 'LPR service unavailable', msg: 'LPR service unavailable' }, 503)
        }
        throw error
      }

      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async delete_all (user: any, camera_id: string) : Promise<generalResponse> {
    try {
      const list = await this.db.camera_lpr_camera.findMany({ where: { camera: { some: { id: camera_id } } } })
      await Promise.all(list.map(async (el_to) => {
        const id = el_to.id
        await this.remove({isSuperAdmin: true}, camera_id, id)
      }))
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }











  async generateROIImage(request, imageWidth, imageHeight) {
    // Create a blank black image
    const image = new Jimp.Jimp({ width: imageWidth, height: imageHeight, color: 0x000000FF});
    const isPointInPolygon = this.isPointInPolygon
    // Draw each ROI polygon
    for (const roi of request.roiCommands) {
        const shapeId = roi.shapeId;
        const color = Jimp.rgbaToInt(shapeId, shapeId, shapeId, 255);

        // Collect polygon points
        const points = roi.vertexCommands.map(vertex => ({
            x: Math.floor((vertex.leftPercent / 100) * imageWidth),
            y: Math.floor((vertex.topPercent / 100) * imageHeight)
        }));

        // Draw polygon (Jimp doesn't natively support polygons, so we use scan)
        image.scan(0, 0, imageWidth, imageHeight, function(x, y, idx) {
            if (isPointInPolygon({ x, y }, points)) {
                this.bitmap.data[idx] = shapeId;     // R
                this.bitmap.data[idx + 1] = shapeId; // G
                this.bitmap.data[idx + 2] = shapeId; // B
                this.bitmap.data[idx + 3] = 255;     // A
            }
        });
    }

    // Save as PNG buffer
    const pngBuffer = await image.getBuffer(Jimp.JimpMime.png);
    const imageBase64 = pngBuffer.toString('base64');

    // Save to file (optional)
    // await image.write('roi_image_jimp.png');

    return imageBase64;
}

  // Helper: Check if a point is inside a polygon
  isPointInPolygon(point, polygon) {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const xi = polygon[i].x, yi = polygon[i].y;
          const xj = polygon[j].x, yj = polygon[j].y;

          const intersect = ((yi > point.y) !== (yj > point.y))
              && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
      }
      return inside;
  }

  async getRoi(user: any, camera_id: string, lpr_id: string): Promise<generalResponse> {
    try {
      // check if camera available
      const where: any = { id: camera_id, AND: [] }
      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
        where.deleted = false
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_lpr_camera.findUnique({ where: { id: lpr_id, camera: { some: { id: camera_id } } }, include: { camera_lpr: true } })
      if (!list) { throw new ConflictException() }
      const data = list.roiData ? list.roiData : "[]"
      return { status: true, data: JSON.parse(data), error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async postRoi(user: any, camera_id: string, lpr_id: string, body: any): Promise<generalResponse> {
    try {
      // check if camera available
      const where: any = { id: camera_id, AND: [] }
      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
        where.deleted = false
      }
      const camera = await this.db.camera.findUnique({ where });
      if (!camera) { throw new ConflictException() }

      const list = await this.db.camera_lpr_camera.findUnique({ where: { id: lpr_id, camera: { some: { id: camera_id } } }, include: { camera_lpr: true } })
      if (!list) { throw new ConflictException() }

      // get profiles from onvif service
      let onvif_response: any = {}
      if (camera.username === 'username' && camera.password === 'password' && camera.thirdParty === true)
      {
        // fake cam
        onvif_response.fake = true;
        onvif_response.data = []
      } else {
        // normal camera (same path and payload structure as onvif.service proxy)
        try {
          const conn = { url: camera.url, username: camera.username, password: camera.password };
          onvif_response = await this.axios.axiosRef.post(this.getOnvifBase() + '/camera/profiles', conn);
        } catch (error) {
          if (error.response && error.response.status >= 500) {
            throw new HttpException({ status: false, data: null, error: 'Camera service unavailable', msg: 'Camera service unavailable' }, 503)
          }
          throw new HttpException({ status: false, data: null, error: 'Failed to get camera profiles', msg: 'Failed to get camera profiles' }, 500)
        }
      }

      if (onvif_response.fake === true || (onvif_response.data && onvif_response.data !== 'error' && onvif_response.data.length > 0)) {
        const profiles = [];
        onvif_response.data.forEach(element => {
          profiles.push({
            profile: element.token,
            rtsp: element.stream.rtsp,
            video: element.video?.source ? true : false,
            video_framerate: element.video?.encoder?.framerate,
            video_bitrate: element.video?.encoder?.bitrate,
            video_encoding: element.video?.encoder?.encoding,
            video_width: element.video?.encoder?.resolution?.width,
            video_height: element.video?.encoder?.resolution?.height,
            audio: element.audio? true : false,
            audio_samplerate: element.audio?.encoder?.samplerate,
            audio_bitrate: element.audio?.encoder?.bitrate,
            audio_encoding: element.audio?.encoder?.encoding,
            ptz: element.ptz ? true : false
          });
        });
        // find min and max width
        const video_profiles = profiles.filter(x => { return x.video === true })
        const sorted = video_profiles.sort((a,b) => { return a.video_width < b.video_width ? 1 : -1 })
        const high = sorted.length > 0 ? sorted[0] : null

        const request = body
        // if (request.roiCommands.length > 0) { request.roiCommands[0].shapeId = 150 }

        const imageWidth = high && high.video_width ? high.video_width : 800;
        const imageHeight = high && high.video_height ? high.video_height : 600;

        const base64 = await this.generateROIImage(request, imageWidth, imageHeight)

        await this.db.camera_lpr_camera.update({ where: { id: lpr_id, camera: { some: { id: camera_id } } }, data: { roi: base64, roiData: JSON.stringify(request.roiCommands) } })
        if (list.status === 'RUNNING' || list.status === 'PENDING' || list.status === 'STARTING') {
          await this.stop(user, camera_id, lpr_id)
          await this.start(user, camera_id, lpr_id)
        }

        return { status: true, data: null, error: null, msg: null }
      } else {
        throw { message: 'invalid onfiv data' }
      }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

}


