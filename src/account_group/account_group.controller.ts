import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';

import { AccountGroupService } from './account_group.service';

import { nameDto, groupSearchQuery } from './account_group.dto';

import { generalResponse } from 'src/app.consts';
import { AccountRoles, User } from '../account/account.decorator';
import { accountGaurd } from '../account/account.gaurd';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('02. user_group')
@Controller('user_group')
export class AccountGroupController {
  constructor(private readonly accountGroupService: AccountGroupService) {}

  @Get('')
  @AccountRoles('usergroup_list')
  @UseGuards(accountGaurd)
  async allGroups(@User() user, @Query() query: groupSearchQuery): Promise<generalResponse> {
    return await this.accountGroupService.allGroups(user, query);
  }

  @Post('')
  @AccountRoles('usergroup_add')
  @UseGuards(accountGaurd)
  async postGroups(@User() user, @Body() body: nameDto): Promise<generalResponse> {
    return await this.accountGroupService.postGroups(user, body);
  }

  @Get(':group_id')
  @AccountRoles('usergroup_list')
  @UseGuards(accountGaurd)
  async getGroups(@Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string): Promise<generalResponse> {
    return await this.accountGroupService.getGroups(group_id);
  }

  @Get(':group_id/role')
  @AccountRoles('usergroup_list')
  @UseGuards(accountGaurd)
  async getAccountRoles(@Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string): Promise<generalResponse> {
    return await this.accountGroupService.getGroupRoles(group_id);
  }

  @Put(':group_id')
  @AccountRoles('usergroup_edit')
  @UseGuards(accountGaurd)
  async putGroups(@User() user, @Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string, @Body() body: nameDto): Promise<generalResponse> {
    return await this.accountGroupService.putGroups(user, group_id, body);
  }

  @Delete(':group_id')
  @AccountRoles('usergroup_delete')
  @UseGuards(accountGaurd)
  async deleteGroups(@User() user, @Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string): Promise<generalResponse> {
    return await this.accountGroupService.deleteGroups(user, group_id);
  }

}
