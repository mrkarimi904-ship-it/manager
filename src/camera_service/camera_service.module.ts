import { Module } from '@nestjs/common';
import { CameraServiceService } from './camera_service.service';
import { CameraServiceController } from './camera_service.controller';
import { DbModule } from 'src/db/db.module';
import { RecorderModule } from 'src/recorder/recorder.module';
import { StreamModule } from 'src/stream/stream.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DbModule, RecorderModule, StreamModule, HttpModule],
  providers: [CameraServiceService],
  controllers: [CameraServiceController],
  exports: [CameraServiceService]
})
export class CameraServiceModule {}
