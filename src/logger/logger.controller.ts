import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';
import * as dtos from './logger.dtos'
import { generalResponse } from 'src/app.consts';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('0. logger')
@Controller('logger')
export class LoggerController {

  constructor(private readonly loggerService: LoggerService) {}

  @Get()
  @AccountRoles('logger_list')
  @UseGuards(AccountGuard)
  async getAll(@User() user, @Query() query: dtos.logSearchDto): Promise<generalResponse> {
    return this.loggerService.getAll(user, query);
  }

  @Get('/cleanup')
  @AccountRoles('logger_list')
  @UseGuards(AccountGuard)
  async cleanUp(@User() user): Promise<generalResponse> {
    return this.loggerService.cleanUp();
  }
}
