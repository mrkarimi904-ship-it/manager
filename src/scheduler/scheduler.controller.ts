import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, ParseUUIDPipe, Query } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import * as dtos from './scheduler.dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { accountGaurd } from 'src/account/account.gaurd';
import { generalResponse } from 'src/app.consts';

@ApiBearerAuth()
@ApiTags('12. Scheduler')
@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('user_account/:user_id')
  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  async post_user_account(@User() user, @Param('user_id', new ParseUUIDPipe({ version: "4" })) user_id: string, @Body() scheduleBody: dtos.scheduleDto): Promise<generalResponse> {
    return this.schedulerService.post_user_account(user, user_id, scheduleBody);
  }

  @Get('user_account/:user_id')
  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  async get_user_accounts(@User() user, @Param('user_id', new ParseUUIDPipe({ version: "4" })) user_id: string, @Query() query: dtos.scheduleSearchDto): Promise<generalResponse> {
    return this.schedulerService.get_user_accounts(user, user_id, query);
  }

  @Get('user_account/:user_id/:id')
  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  async get_user_account(@User() user, @Param('user_id', new ParseUUIDPipe({ version: "4" })) user_id: string, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.schedulerService.get_user_account(user, user_id, id);
  }

  @Put('user_account/:user_id/:id')
  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  async put_user_account(@User() user, @Param('user_id', new ParseUUIDPipe({ version: "4" })) user_id: string, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() scheduleBody: dtos.scheduleEditDto): Promise<generalResponse> {
    return this.schedulerService.put_user_account(user, user_id, id, scheduleBody);
  }

  @Delete('user_account/:user_id/:id')
  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  async delete_user_account(@User() user, @Param('user_id', new ParseUUIDPipe({ version: "4" })) user_id: string, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.schedulerService.delete_user_account(user, user_id, id);
  }












  @Post('user_group/:group_id')
  @AccountRoles('scheduler_user_group')
  @UseGuards(accountGaurd)
  async post_user_group(@User() user, @Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string, @Body() scheduleBody: dtos.scheduleDto): Promise<generalResponse> {
    return this.schedulerService.post_user_group(user, group_id, scheduleBody);
  }

  @Get('user_group/:group_id')
  @AccountRoles('scheduler_user_group')
  @UseGuards(accountGaurd)
  async get_user_groups(@User() user, @Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string, @Query() query: dtos.scheduleSearchDto): Promise<generalResponse> {
    return this.schedulerService.get_user_groups(user, group_id, query);
  }

  @Get('user_group/:group_id/:id')
  @AccountRoles('scheduler_user_group')
  @UseGuards(accountGaurd)
  async get_user_group(@User() user, @Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.schedulerService.get_user_group(user, group_id, id);
  }

  @Put('user_group/:group_id/:id')
  @AccountRoles('scheduler_user_group')
  @UseGuards(accountGaurd)
  async put_user_group(@User() user, @Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() scheduleBody: dtos.scheduleEditDto): Promise<generalResponse> {
    return this.schedulerService.put_user_group(user, group_id, id, scheduleBody);
  }

  @Delete('user_group/:group_id/:id')
  @AccountRoles('scheduler_user_group')
  @UseGuards(accountGaurd)
  async delete_user_group(@User() user, @Param('group_id', new ParseUUIDPipe({ version: "4" })) group_id: string, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.schedulerService.delete_user_group(user, group_id, id);
  }










  @Post('ip_mac/:user_id')
  @AccountRoles('scheduler_ip_mac')
  @UseGuards(accountGaurd)
  async post_ip_mac(@User() user, @Param('user_id', new ParseUUIDPipe({ version: "4" })) user_id: string, @Body() scheduleBody: dtos.scheduleIpMacDto): Promise<generalResponse> {
    return this.schedulerService.post_ip_mac(user, user_id, scheduleBody);
  }

  @Get('ip_mac/:user_id')
  @AccountRoles('scheduler_ip_mac')
  @UseGuards(accountGaurd)
  async get_ip_macs(@User() user, @Param('user_id', new ParseUUIDPipe({ version: "4" })) user_id: string, @Query() query: dtos.scheduleSearchDto): Promise<generalResponse> {
    return this.schedulerService.get_ip_macs(user, user_id, query);
  }

  @Get('ip_mac/:user_id/:id')
  @AccountRoles('scheduler_ip_mac')
  @UseGuards(accountGaurd)
  async get_ip_mac(@User() user, @Param('user_id', new ParseUUIDPipe({ version: "4" })) user_id: string, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.schedulerService.get_ip_mac(user, user_id, id);
  }

  @Put('ip_mac/:user_id/:id')
  @AccountRoles('scheduler_ip_mac')
  @UseGuards(accountGaurd)
  async put_ip_mac(@User() user, @Param('user_id', new ParseUUIDPipe({ version: "4" })) user_id: string, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() scheduleBody: dtos.scheduleIpMacDto): Promise<generalResponse> {
    return this.schedulerService.put_ip_mac(user, user_id, id, scheduleBody);
  }

  @Delete('ip_mac/:user_id/:id')
  @AccountRoles('scheduler_ip_mac')
  @UseGuards(accountGaurd)
  async delete_ip_mac(@User() user, @Param('user_id', new ParseUUIDPipe({ version: "4" })) user_id: string, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.schedulerService.delete_ip_mac(user, user_id, id);
  }
}
