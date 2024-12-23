import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';

import { CameraGroupService } from './camera_group.service';

import * as dtos from './camera_group.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { accountGaurd } from 'src/account/account.gaurd';

@ApiBearerAuth()
@ApiTags('04. camera_group')
@Controller('camera_group')
export class CameraGroupController {
  constructor(private readonly cameraGroupService: CameraGroupService) {}

  @Get('')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async allGroups(@User() user, @Query() query: dtos.groupSearchQuery): Promise<generalResponse> {
    return await this.cameraGroupService.allGroups(user, query);
  }


  @Post('')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async postGroups(@Body() body: dtos.nameDto): Promise<generalResponse> {
    return await this.cameraGroupService.postGroups(body);
  }

  @Get(':group_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async getGroups(@Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string): Promise<generalResponse> {
    return await this.cameraGroupService.getGroups(group_id);
  }

  @Put(':group_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async putGroups(@Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string, @Body() body: dtos.nameDto): Promise<generalResponse> {
    return await this.cameraGroupService.putGroups(group_id, body);
  }

  @Delete(':group_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async deleteGroups(@Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string): Promise<generalResponse> {
    return await this.cameraGroupService.deleteGroups(group_id);
  }
}
