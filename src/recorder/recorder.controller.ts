import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { RecorderService } from './recorder.service';

import * as dtos from './recorder.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { accountGaurd } from 'src/account/account.gaurd';

@ApiBearerAuth()
@ApiTags('10. recorder')
@Controller('recorder')
export class RecorderController {
  constructor(private readonly recorderService: RecorderService) {}

  @Post('status')
  @AccountRoles('recorder_actions')
  @UseGuards(accountGaurd)
  async status(@User() user, @Body() body: dtos.recorderDto): Promise<generalResponse> {
    return this.recorderService.status(user, body);
  }

  @Post('start')
  @AccountRoles('recorder_actions')
  @UseGuards(accountGaurd)
  async start(@User() user, @Body() body: dtos.recorderDto): Promise<generalResponse> {
    return this.recorderService.start(user, body);
  }

  @Post('stop')
  @AccountRoles('recorder_actions')
  @UseGuards(accountGaurd)
  async stop(@User() user, @Body() body: dtos.recorderDto): Promise<generalResponse> {
    return this.recorderService.stop(user, body);
  }
}
