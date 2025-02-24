import { Module } from '@nestjs/common';
import { CameraServiceService } from './camera_service.service';
import { CameraServiceController } from './camera_service.controller';
import { DbModule } from 'src/db/db.module';
import { StreamModule } from 'src/stream/stream.module';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [DbModule, StreamModule, HttpModule, LoggerModule],
  providers: [CameraServiceService],
  controllers: [CameraServiceController],
  exports: [CameraServiceService]
})
export class CameraServiceModule {}
