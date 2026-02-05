import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';

import { CameraGroupService } from './camera_group.service';

import * as dtos from './camera_group.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';

@ApiBearerAuth()
@ApiTags('04. camera_group')
@Controller('camera_group')
export class CameraGroupController {
  constructor(private readonly cameraGroupService: CameraGroupService) {}

  @Get('')
  @AccountRoles('cameragroup_list')
  @UseGuards(AccountGuard)
  async allGroups(@User() user, @Query() query: dtos.groupSearchQuery): Promise<generalResponse> {
    return await this.cameraGroupService.allGroups(user, query);
  }


  @Post('')
  @AccountRoles('cameragroup_add')
  @UseGuards(AccountGuard)
  async postGroups(@User() user, @Body() body: dtos.nameDto): Promise<generalResponse> {
    return await this.cameraGroupService.postGroups(user, body);
  }

  @Get(':group_id')
  @AccountRoles('cameragroup_list')
  @UseGuards(AccountGuard)
  async getGroups(@Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string): Promise<generalResponse> {
    return await this.cameraGroupService.getGroups(group_id);
  }

  @Put(':group_id')
  @AccountRoles('cameragroup_edit')
  @UseGuards(AccountGuard)
  async putGroups(@User() user, @Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string, @Body() body: dtos.nameDto): Promise<generalResponse> {
    return await this.cameraGroupService.putGroups(user, group_id, body);
  }

  @Delete(':group_id')
  @AccountRoles('cameragroup_delete')
  @UseGuards(AccountGuard)
  async deleteGroups(@User() user, @Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string): Promise<generalResponse> {
    return await this.cameraGroupService.deleteGroups(user, group_id);
  }
}
