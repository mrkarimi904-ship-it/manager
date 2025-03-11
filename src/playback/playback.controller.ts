import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
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

  @Get(':recorder_session')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_data(@Param('recorder_session') id: string): Promise<generalResponse> {
    return this.playbackService.playback_data(id);
  }

  @Post(':recorder_session')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_create(@User() user, @Param('recorder_session') recorder_session: string, @Body() body: any): Promise<generalResponse> {
    return this.playbackService.playback_create(user, recorder_session, body);
  }

  @Get(':recorder_session/:playback_session')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_info(@Param('recorder_session') recorder_session: string, @Param('playback_session') id: string): Promise<generalResponse> {
    return this.playbackService.playback_info(recorder_session, id);
  }

  @Post(':recorder_session/:playback_session/start')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_start(@Param('recorder_session') recorder_session: string, @Param('playback_session') id: string, @Body() body: any): Promise<generalResponse> {
    return this.playbackService.playback_start(recorder_session, id, body);
  }

  @Post(':recorder_session/:playback_session/speed')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_speed(@Param('recorder_session') recorder_session: string, @Param('playback_session') id: string, @Body() body: any): Promise<generalResponse> {
    return this.playbackService.playback_speed(recorder_session, id, body);
  }

  @Post(':recorder_session/:playback_session/pause')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_pause(@Param('recorder_session') recorder_session: string, @Param('playback_session') id: string): Promise<generalResponse> {
    return this.playbackService.playback_pause(recorder_session, id);
  }

  @Post(':recorder_session/:playback_session/resume')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_resume(@Param('recorder_session') recorder_session: string, @Param('playback_session') id: string): Promise<generalResponse> {
    return this.playbackService.playback_resume(recorder_session, id);
  }

  @Delete(':recorder_session/:playback_session/stop')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_stop(@Param('recorder_session') recorder_session: string, @Param('playback_session') id: string): Promise<generalResponse> {
    return this.playbackService.playback_stop(recorder_session, id);
  }

  @Get('all/:from/:to')
  @AccountRoles('actions_playback')
  @UseGuards(accountGaurd)
  async playback_list(@User() user, @Param('from') from: number, @Param('to') to: number): Promise<generalResponse> {
    return this.playbackService.playback_list(user, from, to);
  }
}
