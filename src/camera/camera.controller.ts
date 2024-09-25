import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';

import { CameraService } from './camera.service';

import * as dtos from './camera.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('camera')
@Controller('camera')
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  @Get()
  async getAll(): Promise<generalResponse> {
    return this.cameraService.getAll();
  }

  @Get(':id')
  async getSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraService.getSingle(id);
  }

  @Put(':id')
  async putSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() body: dtos.postCameraDto): Promise<generalResponse> {
    return this.cameraService.putSingle(id, body);
  }

  @Post('/pre_register')
  async postPre(@Body() body: dtos.postPreCameraDto): Promise<generalResponse> {
    return this.cameraService.postPre(body);
  }

  @Post()
  async postSingle(@Body() body: dtos.postCameraDto): Promise<generalResponse> {
    return this.cameraService.postSingle(body);
  }

  @Delete(':id')
  async deleteSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraService.deleteSingle(id);
  }
}
