import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';

import { CameraPlaybackService } from './camera_playback.service';

import * as dtos from './camera_playback.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('07. camera_playback')
@Controller('camera_playback')
export class CameraPlaybackController {
  constructor(private readonly cameraPlaybackService: CameraPlaybackService) {}

  @Get()
  async getAll(): Promise<generalResponse> {
    return this.cameraPlaybackService.getAll();
  }

  @Get(':id')
  async getSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraPlaybackService.getSingle(id);
  }

  @Post()
  async postSingle(@Body() body: dtos.postCameraPlaybackDto): Promise<generalResponse> {
    return this.cameraPlaybackService.postSingle(body);
  }

  @Delete(':id')
  async deleteSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraPlaybackService.deleteSingle(id);
  }
}
