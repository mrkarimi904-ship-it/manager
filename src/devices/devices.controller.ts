import { Controller, Get, Post, Body, UseGuards, Param, ParseUUIDPipe, Put, Delete, Query } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto, UpdateDeviceDto, deviceSearchQuery } from './devices.dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';
import { generalResponse } from 'src/app.consts';

@ApiBearerAuth()
@ApiTags('15. devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async create(@User() user, @Body() createDeviceDto: CreateDeviceDto): Promise<generalResponse> {
    return this.devicesService.create(createDeviceDto, user);
  }

  @Get()
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async findAll(@User() user, @Query() query: deviceSearchQuery): Promise<generalResponse> {
    return this.devicesService.findAll(user, query);
  }

  @Get(':id')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async getSingle(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.devicesService.getSingle(user, id);
  }

  @Put(':id')
  @AccountRoles('camera_edit')
  @UseGuards(AccountGuard)
  async putSingle(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() body: UpdateDeviceDto): Promise<generalResponse> {
    return this.devicesService.putSingle(id, body, user);
  }

  @Delete(':id')
  @AccountRoles('camera_delete')
  @UseGuards(AccountGuard)
  async deleteSingle(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.devicesService.deleteSingle(user, id);
  }
}
