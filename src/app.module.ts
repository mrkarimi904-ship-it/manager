import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';

import { DbModule } from './db/db.module';

import { CameraModule } from './camera/camera.module';
import { CameraServiceModule } from './camera_service/camera_service.module';

@Module({
  imports: [ConfigModule.forRoot(), DbModule, CameraModule, CameraServiceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
