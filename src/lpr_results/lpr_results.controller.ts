import { Controller, Get, Post, Body, Param, UseGuards, Query, ParseUUIDPipe, Put } from '@nestjs/common';
import { LprResultsService } from './lpr_results.service';
import * as dtos from './lpr_results.dtos';
import { generalResponse } from 'src/app.consts';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';

@ApiBearerAuth()
@ApiTags('10. lpr_results')
@Controller('lpr_results')
export class LprResultsController {
  constructor(private readonly lprResultsService: LprResultsService) {}

  @Get()
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async findAll(@User() user, @Query() query: dtos.lprSearchQuery): Promise<generalResponse> {
    return this.lprResultsService.findAll(user, query);
  }

  @Get('details/:id')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async findOne(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.lprResultsService.findOne(user, id);
  }

  @Put('details/:id')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async putOne(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() body: dtos.lprUpdateItem): Promise<generalResponse> {
    return this.lprResultsService.putOne(user, id, body);
  }

  @Get('types')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async getTypes(@User() user): Promise<generalResponse> {
    return this.lprResultsService.getTypes(user);
  }

  @Get('brands')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async getBrands(@User() user): Promise<generalResponse> {
    return this.lprResultsService.getBrands(user);
  }

  @Get('colors')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async getColors(@User() user): Promise<generalResponse> {
    return this.lprResultsService.getColors(user);
  }

  @Get('models')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async getModels(@User() user): Promise<generalResponse> {
    return this.lprResultsService.getModels(user);
  }

  @Get('ClearAll')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async getClearAll(@User() user): Promise<generalResponse> {
    return this.lprResultsService.getClearAll(user);
  }

  @Get('report/hourly')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async reportHourly(@User() user, @Query() query: dtos.lprReportQuery): Promise<generalResponse> {
    return this.lprResultsService.reportHourly(user, query);
  }

  @Get('report/weekday')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async reportWeekDay(@User() user, @Query() query: dtos.lprReportQuery): Promise<generalResponse> {
    return this.lprResultsService.reportWeekDay(user, query);
  }

  @Get('report/monthday')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async reportMonthDay(@User() user, @Query() query: dtos.lprReportQuery): Promise<generalResponse> {
    return this.lprResultsService.reportMonthDay(user, query);
  }

  @Get('export_to_zip')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async export(@User() user, @Query() query: dtos.lprExportQuery): Promise<generalResponse> {
    return this.lprResultsService.export(user, query);
  }
}
