import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';

import { CameraService } from './camera.service';

import * as dtos from './camera.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { accountGaurd } from 'src/account/account.gaurd';

@ApiBearerAuth()
@ApiTags('camera')
@Controller('camera')
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  @Get()
  @AccountRoles('camera_list')
  @UseGuards(accountGaurd)
  async getAll(@User() user, @Query() query: dtos.cameraSearchQuery): Promise<generalResponse> {
    return this.cameraService.getAll(user, query);
  }

  @Get(':id')
  @AccountRoles('camera_list')
  @UseGuards(accountGaurd)
  async getSingle(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraService.getSingle(user, id);
  }

  @Get(':id/health')
  @AccountRoles('camera_list')
  @UseGuards(accountGaurd)
  async getHealth(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraService.getHealth(user, id);
  }

  @Get(':id/profiles')
  @AccountRoles('camera_list')
  @UseGuards(accountGaurd)
  async getProfiles(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraService.getProfiles(user, id);
  }

  @Put(':id')
  @AccountRoles('camera_edit')
  @UseGuards(accountGaurd)
  async putSingle(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() body: dtos.postCameraDto): Promise<generalResponse> {
    return this.cameraService.putSingle(id, body, user);
  }

  @Post('/pre_register')
  @AccountRoles('camera_add')
  @UseGuards(accountGaurd)
  async postPre(@Body() body: dtos.postPreCameraDto): Promise<generalResponse> {
    return this.cameraService.postPre(body);
  }

  @Post()
  @AccountRoles('camera_add')
  @UseGuards(accountGaurd)
  async postSingle(@Body() body: dtos.postCameraDto): Promise<generalResponse> {
    return this.cameraService.postSingle(body);
  }

  @Delete(':id')
  @AccountRoles('camera_delete')
  @UseGuards(accountGaurd)
  async deleteSingle(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraService.deleteSingle(user, id);
  }

  @Get('groups')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async allGroups(@User() user, @Query() query: dtos.groupSearchQuery): Promise<generalResponse> {
    return await this.cameraService.allGroups(user, query);
  }


  @Post('groups')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async postGroups(@Body() body: dtos.nameDto): Promise<generalResponse> {
    return await this.cameraService.postGroups(body);
  }

  @Get('groups/:group_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async getGroups(@Param('group_id') group_id: string): Promise<generalResponse> {
    return await this.cameraService.getGroups(group_id);
  }

  @Put('groups/:group_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async putGroups(@Param('group_id') group_id: string, @Body() body: dtos.nameDto): Promise<generalResponse> {
    return await this.cameraService.putGroups(group_id, body);
  }

  @Delete('groups/:group_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async deleteGroups(@Param('group_id') group_id: string): Promise<generalResponse> {
    return await this.cameraService.deleteGroups(group_id);
  }
}
