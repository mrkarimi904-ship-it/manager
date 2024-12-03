import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

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
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async allGroups(@User() user, @Query() query: groupSearchQuery): Promise<generalResponse> {
    return await this.accountGroupService.allGroups(user, query);
  }

  @Post('')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async postGroups(@Body() body: nameDto): Promise<generalResponse> {
    return await this.accountGroupService.postGroups(body);
  }

  @Get(':group_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async getGroups(@Param('group_id') group_id: string): Promise<generalResponse> {
    return await this.accountGroupService.getGroups(group_id);
  }

  @Put(':group_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async putGroups(@Param('group_id') group_id: string, @Body() body: nameDto): Promise<generalResponse> {
    return await this.accountGroupService.putGroups(group_id, body);
  }

  @Delete(':group_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async deleteGroups(@Param('group_id') group_id: string): Promise<generalResponse> {
    return await this.accountGroupService.deleteGroups(group_id);
  }

}
