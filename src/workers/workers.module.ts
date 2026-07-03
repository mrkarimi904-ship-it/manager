import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DbModule } from 'src/db/db.module';
import { CameraServiceModule } from 'src/camera_service/camera_service.module';
import { LprQueueModule } from 'src/lpr_queue/lpr_queue.module';
import { StorageModule } from 'src/storage/storage.module';
import { WorkersService } from './workers.service';
import { WorkersController } from './workers.controller';

@Module({
  imports: [DbModule, HttpModule, CameraServiceModule, LprQueueModule, StorageModule],
  providers: [WorkersService],
  controllers: [WorkersController],
})
export class WorkersModule {}
