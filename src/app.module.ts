import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DbModule } from './db/db.module';

import { AccountModule } from './account/account.module';
import { AccountGroupModule } from './account_group/account_group.module';
import { accountInterceptor } from './account/account.interceptor';
import { AssignModule } from './assign/assign.module';

import { CameraModule } from './camera/camera.module';
import { CameraGroupModule } from './camera_group/camera_group.module';
import { RecorderModule } from './recorder/recorder.module';
import { LiveModule } from './live/live.module';

import { CameraServiceModule } from './camera_service/camera_service.module';
import { CameraRecorderModule } from './camera_recorder/camera_recorder.module';
import { CameraPlaybackModule } from './camera_playback/camera_playback.module';
import { SettingsModule } from './settings/settings.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      serveRoot: '/static'
    }),
    ConfigModule.forRoot(), DbModule, AccountModule, AccountGroupModule, CameraModule, CameraGroupModule, LiveModule, RecorderModule, CameraServiceModule, CameraRecorderModule, CameraPlaybackModule, AssignModule, SettingsModule, LoggerModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: accountInterceptor
    }
  ],
})
export class AppModule {}
