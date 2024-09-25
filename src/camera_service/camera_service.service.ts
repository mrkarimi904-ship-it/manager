import { Injectable } from '@nestjs/common';

import { DbService } from 'src/db/db.service';

import * as dtos from './camera_service.dtos';

import { generalResponse } from 'src/app.consts';

@Injectable()
export class CameraServiceService {
  constructor(private db: DbService) {}

  async getAll(): Promise<generalResponse> {
    const cameras: dtos.cameraServiceDto[] = await this.db.camera_service.findMany();
    const response: generalResponse = { status: true, data: cameras, error: null, msg: null };
    return response;
  }

  async getSingle(id: string): Promise<generalResponse> {
    const cameras: dtos.cameraServiceDto = await this.db.camera_service.findUnique({ where: { id: id } });
    const response: generalResponse = { status: true, data: cameras, error: null, msg: null };
    return response;
  }

  async postSingle(body: dtos.postCameraServiceDto): Promise<generalResponse> {
    const cameras: dtos.cameraServiceDto = await this.db.camera_service.create({data: body})
    const response: generalResponse = { status: true, data: cameras, error: null, msg: null };
    return response;
  }

  async deleteSingle(id: string): Promise<generalResponse> {
    const cameras: dtos.cameraServiceDto = await this.db.camera_service.delete({ where: { id: id } })
    const response: generalResponse = { status: true, data: cameras, error: null, msg: null };
    return response;
  }
}
