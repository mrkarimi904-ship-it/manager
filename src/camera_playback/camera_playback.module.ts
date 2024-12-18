import { Module } from '@nestjs/common';
import { CameraPlaybackService } from './camera_playback.service';
import { CameraPlaybackController } from './camera_playback.controller';
import { DbModule } from 'src/db/db.module';
import { RecorderModule } from 'src/recorder/recorder.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DbModule, RecorderModule, HttpModule],
  providers: [CameraPlaybackService],
  controllers: [CameraPlaybackController],
  exports: [CameraPlaybackService]
})
export class CameraPlaybackModule {}
