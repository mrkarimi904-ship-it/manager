import { Module } from '@nestjs/common';
import { CameraGroupController } from './camera_group.controller';
import { CameraGroupService } from './camera_group.service';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';
import { CameraServiceModule } from 'src/camera_service/camera_service.module';
import { RecorderModule } from 'src/recorder/recorder.module';
import { StreamModule } from 'src/stream/stream.module';

@Module({
  imports: [DbModule, HttpModule, CameraServiceModule, RecorderModule, StreamModule],
  controllers: [CameraGroupController],
  providers: [CameraGroupService]
})
export class CameraGroupModule {}
