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

  @Post('user_account')
  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  async post_user_account(@User() user, @Body() scheduleBody: dtos.scheduleDto): Promise<generalResponse> {
    return this.schedulerService.post_user_account(user, scheduleBody);
  }

  @Get('user_account')
  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  async get_user_accounts(@User() user, @Query() query: dtos.scheduleSearchDto): Promise<generalResponse> {
    return this.schedulerService.get_user_accounts(user, query);
  }

  @Get('user_account/:id')
  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  async get_user_account(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.schedulerService.get_user_account(user, id);
  }

  @Put('user_account/:id')
  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  async put_user_account(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() scheduleBody: dtos.scheduleEditDto): Promise<generalResponse> {
    return this.schedulerService.put_user_account(user, id, scheduleBody);
  }

  @Delete('user_account/:id')
  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  async delete_user_account(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.schedulerService.delete_user_account(user, id);
  }

  @Get('user_account/:user_id/verify')
  async verify_user_account(@Param('user_id', new ParseUUIDPipe({ version: "4" })) user_id: string): Promise<generalResponse> {
    return this.schedulerService.verify_user_account(user_id);
  }

}
