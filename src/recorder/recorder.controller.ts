import { Body, Controller, Get, Post } from '@nestjs/common';

import { RecorderService } from './recorder.service';

import * as dtos from './recorder.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('recorder')
@Controller('recorder')
export class RecorderController {
  constructor(private readonly recorderService: RecorderService) {}

  @Post('status')
  async status(@Body() body: dtos.recorderDto): Promise<generalResponse> {
    return this.recorderService.status(body);
  }

  @Post('start')
  async start(@Body() body: dtos.recorderDto): Promise<generalResponse> {
    return this.recorderService.start(body);
  }

  @Post('stop')
  async stop(@Body() body: dtos.recorderDto): Promise<generalResponse> {
    return this.recorderService.stop(body);
  }
}
