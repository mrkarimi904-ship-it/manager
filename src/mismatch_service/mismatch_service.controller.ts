import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';

import { MismatchServiceService } from './mismatch_service.service';

import * as dtos from './mismatch_service.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('09. mismatch_service')
@Controller('mismatch_service')
export class MismatchServiceController {
  constructor(private readonly mismatchServiceService: MismatchServiceService) {}

  @Get()
  async getAll(): Promise<generalResponse> {
    return this.mismatchServiceService.getAll();
  }

  @Get(':id')
  async getSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.mismatchServiceService.getSingle(id);
  }

  @Post()
  async postSingle(@Body() body: dtos.postMismatchServiceDto): Promise<generalResponse> {
    return this.mismatchServiceService.postSingle(body);
  }

  @Delete(':id')
  async deleteSingle(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.mismatchServiceService.deleteSingle(id);
  }
}
