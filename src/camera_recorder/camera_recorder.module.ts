import { Module } from '@nestjs/common';
import { CameraRecorderService } from './camera_recorder.service';
import { CameraRecorderController } from './camera_recorder.controller';
import { DbModule } from 'src/db/db.module';
import { RecorderModule } from 'src/recorder/recorder.module';
import { StreamModule } from 'src/stream/stream.module';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [DbModule, RecorderModule, StreamModule, HttpModule, LoggerModule],
  providers: [CameraRecorderService],
  controllers: [CameraRecorderController],
  exports: [CameraRecorderService]
})
export class CameraRecorderModule {}
