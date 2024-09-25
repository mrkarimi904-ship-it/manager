import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';

import { CameraServiceService } from './camera_service.service';

import * as dtos from './camera_service.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('camera_service')
@Controller('camera_service')
export class CameraServiceController {
  constructor(private readonly cameraServiceService: CameraServiceService) {}

  @Get()
  async getAll(): Promise<generalResponse> {
    return this.cameraServiceService.getAll();
  }

  @Get(':id')
  async getSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraServiceService.getSingle(id);
  }

  @Post()
  async postSingle(@Body() body: dtos.postCameraServiceDto): Promise<generalResponse> {
    return this.cameraServiceService.postSingle(body);
  }

  @Delete(':id')
  async deleteSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraServiceService.deleteSingle(id);
  }
}
