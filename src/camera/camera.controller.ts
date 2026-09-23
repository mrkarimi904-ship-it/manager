import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';

import { CameraService } from './camera.service';

import * as dtos from './camera.dtos';
import { generalResponse } from 'src/app.consts';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';

@ApiBearerAuth()
@ApiTags('03. camera')
@Controller('camera')
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  @Get()
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async getAll(@User() user, @Query() query: dtos.cameraSearchQuery): Promise<generalResponse> {
    return this.cameraService.getAll(user, query);
  }

  @Get(':id')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async getSingle(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraService.getSingle(user, id);
  }

  @Get(':id/health')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async getHealth(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraService.getHealth(user, id);
  }

  @Get(':id/profiles')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async getProfiles(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraService.getProfiles(user, id);
  }

  @Get(':id/snapshot')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async getSnapshot(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraService.getSnapshot(user, id);
  }

  @Put(':id')
  @AccountRoles('camera_edit')
  @UseGuards(AccountGuard)
  async putSingle(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() body: dtos.editCameraDto): Promise<generalResponse> {
    return this.cameraService.putSingle(id, body, user);
  }

  @Put(':id/profile')
  @AccountRoles('camera_edit')
  @UseGuards(AccountGuard)
  async putSingleProfile(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() body: dtos.editCameraProfileDto): Promise<generalResponse> {
    return this.cameraService.putSingleProfile(id, body, user);
  }

  @Put(':id/camera-service')
  @AccountRoles('camera_edit')
  @UseGuards(AccountGuard)
  async putCameraService(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() body: dtos.reassignCameraServiceDto): Promise<generalResponse> {
    return this.cameraService.putCameraService(user, id, body);
  }

  @Post(':id/sync-capabilities')
  @AccountRoles('camera_edit')
  @UseGuards(AccountGuard)
  async syncCapabilities(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.cameraService.syncCapabilities(id, user);
  }

  @Post('/pre_register')
  @AccountRoles('camera_add')
  @UseGuards(AccountGuard)
  async postPre(@Body() body: dtos.postPreCameraDto): Promise<generalResponse> {
    return this.cameraService.postPre(body);
  }

  @Post('/fast_register')
  @AccountRoles('camera_add')
  @UseGuards(AccountGuard)
  async postFastRegister(@User() user, @Body() body: dtos.postPreCameraDto): Promise<generalResponse> {
    return this.cameraService.postFastRegister(user, body);
  }

  @Post('/by_rtsp')
  @AccountRoles('camera_add')
  @UseGuards(AccountGuard)
  async postRegisterByRtsp(@User() user, @Body() body: dtos.postCameraDto): Promise<generalResponse> {
    return this.cameraService.postRegisterByRtsp(user, body);
  }

  @Post('/is_added')
  @AccountRoles('camera_add')
  @UseGuards(AccountGuard)
  async isAdded(@Body() body: dtos.postPreCameraDto): Promise<generalResponse> {
    return this.cameraService.isAdded(body);
  }

  @Post()
  @AccountRoles('camera_add')
  @UseGuards(AccountGuard)
  async postSingle(@User() user, @Body() body: dtos.postCameraDto): Promise<generalResponse> {
    return this.cameraService.postSingle(user, body);
  }

  @Delete(':id')
  @AccountRoles('camera_delete')
  @UseGuards(AccountGuard)
  async deleteSingle(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Query() query: dtos.cameraDeleteQuery): Promise<generalResponse> {
    return this.cameraService.deleteSingle(user, id, query);
  }
}
