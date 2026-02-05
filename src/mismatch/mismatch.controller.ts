import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';

import { MismatchService } from './mismatch.service';

import * as dtos from './mismatch.dto';
import { generalResponse } from 'src/app.consts';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';

@ApiBearerAuth()
@ApiTags('10. mismatch')
@Controller('mismatch')
export class MismatchController {
  constructor(private readonly mismatchService: MismatchService) {}

  @Get()
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async findAll(@User() user): Promise<generalResponse> {
    return this.mismatchService.findAll(user);
  }

  @Get(':id')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async findOne(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.mismatchService.findOne(user, id);
  }

  @Post()
  @AccountRoles('camera_edit')
  @UseGuards(AccountGuard)
  async create(@User() user, @Body() body: dtos.CreateMismatchDto): Promise<generalResponse> {
    return this.mismatchService.create(user, body);
  }

  @Put(':id')
  @AccountRoles('camera_edit')
  @UseGuards(AccountGuard)
  async update(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() body: dtos.UpdateMismatchDto): Promise<generalResponse> {
    return this.mismatchService.update(user, id, body);
  }

  @Post(':id/start')
  @AccountRoles('camera_edit')
  @UseGuards(AccountGuard)
  async start(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.mismatchService.start(user, id);
  }

  @Post(':id/stop')
  @AccountRoles('camera_edit')
  @UseGuards(AccountGuard)
  async stop(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.mismatchService.stop(user, id);
  }

  @Delete(':id')
  @AccountRoles('camera_delete')
  @UseGuards(AccountGuard)
  async delete(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.mismatchService.delete(user, id);
  }
}
