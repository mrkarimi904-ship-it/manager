import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, ParseUUIDPipe } from '@nestjs/common';
import { LprListService } from './lpr_list.service';
import * as dtos from './lpr_list.dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';
import { generalResponse } from 'src/app.consts';

@ApiBearerAuth()
@ApiTags('11. lpr_list')
@Controller('lpr_list')
export class LprListController {
  constructor(private readonly lprListService: LprListService) {}

  @Post()
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async create(@User() user, @Body() createLprListDto: dtos.CreateLprListDto): Promise<generalResponse> {
    return this.lprListService.create(user, createLprListDto);
  }

  @Get()
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async findAll(@User() user, @Query() query: dtos.searchLprListDto): Promise<generalResponse> {
    return this.lprListService.findAll(user, query);
  }

  @Get(':id')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async findOne(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.lprListService.findOne(user, id);
  }

  @Put(':id')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async update(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateLprListDto: dtos.UpdateLprListDto): Promise<generalResponse> {
    return this.lprListService.update(user, id, updateLprListDto);
  }

  @Delete(':id')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async remove(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.lprListService.remove(user, id);
  }

  @Post(':id/image')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async createImage(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() CreateLprListImageDto: dtos.CreateLprListImageDto): Promise<generalResponse> {
    return this.lprListService.createImage(user, id, CreateLprListImageDto);
  }

  @Delete(':id/image/:image_id')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async deleteImage(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Param('image_id', new ParseUUIDPipe({ version: "4" })) image_id: string): Promise<generalResponse> {
    return this.lprListService.deleteImage(user, id, image_id);
  }
}
