import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { OnvifService } from './onvif.service';
import { generalResponse } from 'src/app.consts';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';

@ApiBearerAuth()
@ApiTags('onvif')
@Controller('onvif')
export class OnvifController {
  constructor(private readonly onvifService: OnvifService) {}

  @Get('discovery')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async discovery(@User() user): Promise<generalResponse> {
    return this.onvifService.discovery(user);
  }

  @Post(':cameraId/camera')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async cameraConnect(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera', body);
  }

  @Post(':cameraId/camera/profiles')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async cameraProfiles(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/profiles', body);
  }

  @Post(':cameraId/camera/audio-profiles')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async cameraAudioProfiles(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/audio-profiles', body);
  }

  @Post(':cameraId/camera/info')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async cameraInfo(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/info', body);
  }

  @Post(':cameraId/camera/capabilitie')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async cameraCapabilities(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/capabilitie', body);
  }

  @Post(':cameraId/camera/video-encoders')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async videoEncoders(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/video-encoders', body);
  }

  @Post(':cameraId/camera/video-sources')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async videoSources(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/video-sources', body);
  }

  @Post(':cameraId/camera/video-encoder-options')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async videoEncoderOptions(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/video-encoder-options', body);
  }

  @Post(':cameraId/camera/video-source-options')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async videoSourceOptions(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/video-source-options', body);
  }

  @Post(':cameraId/camera/video-encoder')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async videoEncoder(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/video-encoder', body);
  }

  @Post(':cameraId/camera/update-video-encoder')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async updateVideoEncoder(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/update-video-encoder', body);
  }

  @Post(':cameraId/camera/update-video-resolution')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async updateVideoResolution(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/update-video-resolution', body);
  }

  @Post(':cameraId/camera/create-profile')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async cameraCreateProfile(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/create-profile', body);
  }

  @Delete(':cameraId/camera/delete-profile')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async cameraDeleteProfile(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'DELETE', 'camera/delete-profile', body);
  }

  @Post(':cameraId/camera/add-encoder')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async addEncoderToProfile(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/add-encoder', body);
  }

  @Post(':cameraId/camera/add-source')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async addSourceToProfile(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/add-source', body);
  }

  @Post(':cameraId/camera/snapshot')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async cameraSnapshot(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/snapshot', body);
  }

  @Post(':cameraId/camera/udpStreamUrl')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async cameraUdpStreamUrl(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'camera/udpStreamUrl', body);
  }

  @Post(':cameraId/ptz/nodes')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzGetNodes(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/nodes', body);
  }

  @Post(':cameraId/ptz/node')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzGetNode(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/node', body);
  }

  @Post(':cameraId/ptz/configurations')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzConfigurations(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/configurations', body);
  }

  @Post(':cameraId/ptz/move/relative')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzRelativeMove(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/move/relative', body);
  }

  @Post(':cameraId/ptz/move/absolute')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzAbsoluteMove(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/move/absolute', body);
  }

  @Post(':cameraId/ptz/move/continuous')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzContinuousMove(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/move/continuous', body);
  }

  @Post(':cameraId/ptz/move/stop')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzStop(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/move/stop', body);
  }

  @Post(':cameraId/ptz/move/status')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzGetStatus(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/move/status', body);
  }

  @Post(':cameraId/ptz/preset/list')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzGetPresets(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/preset/list', body);
  }

  @Post(':cameraId/ptz/preset/set')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzSetPreset(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/preset/set', body);
  }

  @Post(':cameraId/ptz/preset/go')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzGoPreset(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/preset/go', body);
  }

  @Post(':cameraId/ptz/preset/remove')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzRemovePreset(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/preset/remove', body);
  }

  @Post(':cameraId/ptz/preset/go-home')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzGoHome(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/preset/go-home', body);
  }

  @Post(':cameraId/ptz/preset/set-home')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async ptzSetHome(@User() user, @Param('cameraId', new ParseUUIDPipe({ version: '4' })) cameraId: string, @Body() body: any): Promise<generalResponse> {
    return this.onvifService.proxy(user, cameraId, 'POST', 'ptz/preset/set-home', body);
  }
}
