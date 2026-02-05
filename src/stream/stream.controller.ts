import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { StreamService } from './stream.service';

import * as dtos from './stream.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';

@ApiBearerAuth()
@ApiTags('09. stream')
@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post('status')
  @AccountRoles('actions_live')
  @UseGuards(AccountGuard)
  async status(@User() user, @Body() body: dtos.streamDto): Promise<generalResponse> {
    return this.streamService.status(user, body);
  }

  @Post('start')
  @AccountRoles('actions_live')
  @UseGuards(AccountGuard)
  async start(@User() user, @Body() body: dtos.streamDto): Promise<generalResponse> {
    return this.streamService.start(user, body);
  }

  @Post('stop')
  @AccountRoles('actions_live')
  @UseGuards(AccountGuard)
  async stop(@User() user, @Body() body: dtos.streamDto): Promise<generalResponse> {
    return this.streamService.stop(user, body);
  }
}
