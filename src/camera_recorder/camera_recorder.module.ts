import { Module } from '@nestjs/common';
import { CameraRecorderService } from './camera_recorder.service';
import { CameraRecorderController } from './camera_recorder.controller';
import { DbModule } from 'src/db/db.module';
import { RecorderModule } from 'src/recorder/recorder.module';
import { LiveModule } from 'src/live/live.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DbModule, RecorderModule, LiveModule, HttpModule],
  providers: [CameraRecorderService],
  controllers: [CameraRecorderController],
  exports: [CameraRecorderService]
})
export class CameraRecorderModule {}
