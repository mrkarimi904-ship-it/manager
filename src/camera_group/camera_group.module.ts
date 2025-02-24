import { Module } from '@nestjs/common';
import { CameraGroupController } from './camera_group.controller';
import { CameraGroupService } from './camera_group.service';
import { DbModule } from 'src/db/db.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [DbModule, LoggerModule],
  controllers: [CameraGroupController],
  providers: [CameraGroupService]
})
export class CameraGroupModule {}
