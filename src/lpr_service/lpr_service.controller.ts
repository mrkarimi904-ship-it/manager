import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';

import { LprServiceService } from './lpr_service.service';

import * as dtos from './lpr_service.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('08. lpr_service')
@Controller('lpr_service')
export class LprServiceController {
  constructor(private readonly lprServiceService: LprServiceService) {}

  @Get()
  async getAll(): Promise<generalResponse> {
    return this.lprServiceService.getAll();
  }

  @Get('status')
  async getStatus(): Promise<generalResponse> {
    return this.lprServiceService.getStatus();
  }

  @Get(':id')
  async getSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.lprServiceService.getSingle(id);
  }

  @Post()
  async postSingle(@Body() body: dtos.postLprServiceDto): Promise<generalResponse> {
    return this.lprServiceService.postSingle(body);
  }

  @Delete(':id')
  async deleteSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.lprServiceService.deleteSingle(id);
  }

  // @Post(':id/restart')
  // async postRestart(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
  //   return this.lprServiceService.postRestart(id);
  // }
}
