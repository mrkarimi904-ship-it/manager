import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { LiveService } from './live.service';

import * as dtos from './live.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { accountGaurd } from 'src/account/account.gaurd';

@ApiBearerAuth()
@ApiTags('09. live')
@Controller('live')
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  @Post('status')
  @AccountRoles('live_actions')
  @UseGuards(accountGaurd)
  async status(@User() user, @Body() body: dtos.liveDto): Promise<generalResponse> {
    return this.liveService.status(user, body);
  }

  @Post('start')
  @AccountRoles('live_actions')
  @UseGuards(accountGaurd)
  async start(@User() user, @Body() body: dtos.liveDto): Promise<generalResponse> {
    return this.liveService.start(user, body);
  }

  @Post('stop')
  @AccountRoles('live_actions')
  @UseGuards(accountGaurd)
  async stop(@User() user, @Body() body: dtos.liveDto): Promise<generalResponse> {
    return this.liveService.stop(user, body);
  }
}
