import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';

import { CameraRecorderService } from './camera_recorder.service';

import * as dtos from './camera_recorder.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('08. camera_recorder')
@Controller('camera_recorder')
export class CameraRecorderController {
  constructor(private readonly cameraRecorderService: CameraRecorderService) {}

  @Get()
  async getAll(): Promise<generalResponse> {
    return this.cameraRecorderService.getAll();
  }

  @Get(':id')
  async getSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraRecorderService.getSingle(id);
  }

  @Post()
  async postSingle(@Body() body: dtos.postCameraRecorderDto): Promise<generalResponse> {
    return this.cameraRecorderService.postSingle(body);
  }

  @Delete(':id')
  async deleteSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraRecorderService.deleteSingle(id);
  }
}
