import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DbModule } from 'src/db/db.module';
import { CameraServiceModule } from 'src/camera_service/camera_service.module';
import { WorkersService } from './workers.service';
import { WorkersController } from './workers.controller';

@Module({
  imports: [DbModule, HttpModule, CameraServiceModule],
  providers: [WorkersService],
  controllers: [WorkersController],
})
export class WorkersModule {}
