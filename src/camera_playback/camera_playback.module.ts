import { Module } from '@nestjs/common';
import { CameraPlaybackService } from './camera_playback.service';
import { CameraPlaybackController } from './camera_playback.controller';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [DbModule, HttpModule, LoggerModule],
  providers: [CameraPlaybackService],
  controllers: [CameraPlaybackController],
  exports: [CameraPlaybackService]
})
export class CameraPlaybackModule {}
