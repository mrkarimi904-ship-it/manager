import { Module } from '@nestjs/common';
import { CameraController } from './camera.controller';
import { CameraService } from './camera.service';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';
import { CameraServiceModule } from 'src/camera_service/camera_service.module';
import { RecorderModule } from 'src/recorder/recorder.module';
import { StreamModule } from 'src/stream/stream.module';
import { CameraRecorderModule } from 'src/camera_recorder/camera_recorder.module';
import { LoggerModule } from 'src/logger/logger.module';
import { LicenseModule } from 'src/license/license.module';
import { LprModule } from 'src/lpr/lpr.module';

@Module({
  imports: [DbModule, HttpModule, CameraServiceModule, RecorderModule, StreamModule, CameraRecorderModule, LoggerModule, LicenseModule, LprModule],
  controllers: [CameraController],
  providers: [CameraService]
})
export class CameraModule {}
