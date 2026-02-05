import { Module } from '@nestjs/common';
import { CameraRecorderService } from './camera_recorder.service';
import { CameraRecorderController } from './camera_recorder.controller';
import { DbModule } from 'src/db/db.module';
import { StreamModule } from 'src/stream/stream.module';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'src/logger/logger.module';
import { LicenseModule } from 'src/license/license.module';

@Module({
  imports: [DbModule, StreamModule, HttpModule, LoggerModule, LicenseModule],
  providers: [CameraRecorderService],
  controllers: [CameraRecorderController],
  exports: [CameraRecorderService]
})
export class CameraRecorderModule {}
