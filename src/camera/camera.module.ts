import { Module } from '@nestjs/common';
import { CameraController } from './camera.controller';
import { CameraService } from './camera.service';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';
import { CameraServiceModule } from 'src/camera_service/camera_service.module';
import { RecorderModule } from 'src/recorder/recorder.module';
import { LiveModule } from 'src/live/live.module';

@Module({
  imports: [DbModule, HttpModule, CameraServiceModule, RecorderModule, LiveModule],
  controllers: [CameraController],
  providers: [CameraService]
})
export class CameraModule {}
