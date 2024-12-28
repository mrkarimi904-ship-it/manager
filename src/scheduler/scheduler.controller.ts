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

  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  @Post('user_account')
  async post_user_account(@User() user, @Body() scheduleBody: dtos.scheduleDto): Promise<generalResponse> {
    return this.schedulerService.post_user_account(user, scheduleBody);
  }

  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  @Get('user_account')
  async get_user_accounts(@User() user, @Query() query: dtos.scheduleSearchDto): Promise<generalResponse> {
    return this.schedulerService.get_user_accounts(user, query);
  }

  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  @Get('user_account/:id')
  async get_user_account(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.schedulerService.get_user_account(user, id);
  }

  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  @Put('user_account/:id')
  async put_user_account(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() scheduleBody: dtos.scheduleDto): Promise<generalResponse> {
    return this.schedulerService.put_user_account(user, id, scheduleBody);
  }

  @AccountRoles('scheduler_user_account')
  @UseGuards(accountGaurd)
  @Delete('user_account/:id')
  async delete_user_account(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.schedulerService.delete_user_account(user, id);
  }

}
