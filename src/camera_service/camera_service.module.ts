import { Module } from '@nestjs/common';
import { CameraServiceService } from './camera_service.service';
import { CameraServiceController } from './camera_service.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  providers: [CameraServiceService],
  controllers: [CameraServiceController]
})
export class CameraServiceModule {}
