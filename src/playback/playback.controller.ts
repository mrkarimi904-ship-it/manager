import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PlaybackService } from './playback.service';
// import { CreatePlaybackDto } from './playback.dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { generalResponse } from 'src/app.consts';
import { AccountRoles, User } from 'src/account/account.decorator';
import { accountGaurd } from 'src/account/account.gaurd';


@ApiBearerAuth()
@ApiTags('11. Playback')
@Controller('playback')
export class PlaybackController {
  constructor(private readonly playbackService: PlaybackService) {}

  @Post()
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_create(@User() user, @Body() body: any): Promise<generalResponse> {
    return this.playbackService.playback_create(user, body);
  }

  @Get(':playback_session/info')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_info(@Param('playback_session') id: string): Promise<generalResponse> {
    return this.playbackService.playback_info(id);
  }

  @Get(':recorder_session/data')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_data(@Param('recorder_session') id: string): Promise<generalResponse> {
    return this.playbackService.playback_data(id);
  }

  @Post(':playback_session/start')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_start(@Param('playback_session') id: string, @Body() body: any): Promise<generalResponse> {
    return this.playbackService.playback_start(id, body);
  }

  @Post(':playback_session/speed')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_speed(@Param('playback_session') id: string, @Body() body: any): Promise<generalResponse> {
    return this.playbackService.playback_speed(id, body);
  }

  @Post(':playback_session/pause')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_pause(@Param('playback_session') id: string): Promise<generalResponse> {
    return this.playbackService.playback_pause(id);
  }

  @Post(':playback_session/resume')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_resume(@Param('playback_session') id: string): Promise<generalResponse> {
    return this.playbackService.playback_resume(id);
  }

  @Delete(':playback_session/stop')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_stop(@Param('playback_session') id: string): Promise<generalResponse> {
    return this.playbackService.playback_stop(id);
  }

  @Get('all/:from/:to')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_list(@User() user, @Param('from') from: number, @Param('to') to: number): Promise<generalResponse> {
    return this.playbackService.playback_list(user, from, to);
  }
}
