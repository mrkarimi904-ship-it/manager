import { Body, Controller, Get, Post } from '@nestjs/common';

import { LiveService } from './live.service';

import * as dtos from './live.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('live')
@Controller('live')
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  @Post('status')
  async status(@Body() body: dtos.liveDto): Promise<generalResponse> {
    return this.liveService.status(body);
  }

  @Post('start')
  async start(@Body() body: dtos.liveDto): Promise<generalResponse> {
    return this.liveService.start(body);
  }

  @Post('stop')
  async stop(@Body() body: dtos.liveDto): Promise<generalResponse> {
    return this.liveService.stop(body);
  }
}
