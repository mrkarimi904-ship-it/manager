import { Module } from '@nestjs/common';
import { RecorderService } from './recorder.service';
import { RecorderController } from './recorder.controller';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'src/logger/logger.module';
import { CameraRecorderModule } from 'src/camera_recorder/camera_recorder.module';
import { StreamModule } from 'src/stream/stream.module';

@Module({
  imports: [DbModule, HttpModule, LoggerModule, CameraRecorderModule, StreamModule],
  providers: [RecorderService],
  controllers: [RecorderController],
  exports: [RecorderService]
})
export class RecorderModule {}
