import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';

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

  @Get(':camera_id')
  @AccountRoles('actions_recorder')
  @UseGuards(accountGaurd)
  async get_list(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string): Promise<generalResponse> {
    return this.recorderService.get_list(user, camera_id);
  }

  @Post(':camera_id')
  @AccountRoles('actions_recorder')
  @UseGuards(accountGaurd)
  async add_item(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string, @Body() body: dtos.recorderPostDto): Promise<generalResponse> {
    return this.recorderService.add_item(user, camera_id, body);
  }

  @Get(':camera_id/:recorder_id')
  @AccountRoles('actions_recorder')
  @UseGuards(accountGaurd)
  async get_item(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string , @Param('recorder_id', new ParseUUIDPipe({ version: "4" })) recorder_id: string): Promise<generalResponse> {
    return this.recorderService.get_item(user, camera_id, recorder_id);
  }

  @Put(':camera_id/:recorder_id')
  @AccountRoles('actions_recorder')
  @UseGuards(accountGaurd)
  async put_item(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string , @Param('recorder_id', new ParseUUIDPipe({ version: "4" })) recorder_id: string, @Body() body: dtos.recorderPutDto): Promise<generalResponse> {
    return this.recorderService.put_item(user, camera_id, recorder_id, body);
  }

  @Delete(':camera_id/:recorder_id')
  @AccountRoles('actions_recorder')
  @UseGuards(accountGaurd)
  async delete_item(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string , @Param('recorder_id', new ParseUUIDPipe({ version: "4" })) recorder_id: string): Promise<generalResponse> {
    return this.recorderService.delete_item(user, camera_id, recorder_id);
  }

  @Post(':camera_id/:recorder_id/start')
  @AccountRoles('actions_recorder')
  @UseGuards(accountGaurd)
  async start_item(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string , @Param('recorder_id', new ParseUUIDPipe({ version: "4" })) recorder_id: string): Promise<generalResponse> {
    return this.recorderService.start_item(user, camera_id, recorder_id);
  }

  @Post(':camera_id/:recorder_id/stop')
  @AccountRoles('actions_recorder')
  @UseGuards(accountGaurd)
  async stop_item(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string , @Param('recorder_id', new ParseUUIDPipe({ version: "4" })) recorder_id: string): Promise<generalResponse> {
    return this.recorderService.stop_item(user, camera_id, recorder_id);
  }

  @Post(':camera_id/:recorder_id/clear')
  @AccountRoles('actions_recorder')
  @UseGuards(accountGaurd)
  async clear_item(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string , @Param('recorder_id', new ParseUUIDPipe({ version: "4" })) recorder_id: string): Promise<generalResponse> {
    return this.recorderService.clear_item(user, camera_id, recorder_id);
  }

}
