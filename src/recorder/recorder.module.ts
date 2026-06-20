import { Module } from '@nestjs/common';
import { RecorderService } from './recorder.service';
import { RecorderController } from './recorder.controller';
import { RecorderScheduleService } from './recorder_schedule.service';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'src/logger/logger.module';
import { CameraRecorderModule } from 'src/camera_recorder/camera_recorder.module';
import { StreamModule } from 'src/stream/stream.module';
import { LicenseModule } from 'src/license/license.module';

@Module({
  imports: [DbModule, HttpModule, LoggerModule, CameraRecorderModule, StreamModule, LicenseModule],
  providers: [RecorderService, RecorderScheduleService],
  controllers: [RecorderController],
  exports: [RecorderService, RecorderScheduleService]
})
export class RecorderModule {}
