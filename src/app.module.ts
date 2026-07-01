import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CacheModule } from '@nestjs/cache-manager';
import { DbModule } from './db/db.module';
import { EventEmitterModule } from '@nestjs/event-emitter'

import { AccountModule } from './account/account.module';
import { AccountGroupModule } from './account_group/account_group.module';
import { accountInterceptor } from './account/account.interceptor';
import { AssignModule } from './assign/assign.module';

import { CameraModule } from './camera/camera.module';
import { CameraGroupModule } from './camera_group/camera_group.module';
import { RecorderModule } from './recorder/recorder.module';
import { StreamModule } from './stream/stream.module';

import { CameraServiceModule } from './camera_service/camera_service.module';
import { CameraRecorderModule } from './camera_recorder/camera_recorder.module';
import { CameraPlaybackModule } from './camera_playback/camera_playback.module';
import { SettingsModule } from './settings/settings.module';
import { LoggerModule } from './logger/logger.module';
import { PlaybackModule } from './playback/playback.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { LicenseModule } from './license/license.module';
import { LprQueueModule } from './lpr_queue/lpr_queue.module';
import { LprServiceModule } from './lpr_service/lpr_service.module';
import { LprModule } from './lpr/lpr.module';
import { LprResultsModule } from './lpr_results/lpr_results.module';
import { LprListModule } from './lpr_list/lpr_list.module';
import { DevicesModule } from './devices/devices.module';
import { OperationsModule } from './operations/operations.module';
import { MismatchServiceModule } from './mismatch_service/mismatch_service.module';
import { MismatchModule } from './mismatch/mismatch.module';
import { TileviewModule } from './tileview/tileview.module';
import { TilelayoutModule } from './tilelayout/tilelayout.module';
import { OnvifModule } from './onvif/onvif.module';
import { WebhookModule } from './webhook/webhook.module';
import { WorkersModule } from './workers/workers.module';
import { StorageModule } from './storage/storage.module';
import { BackupRestoreModule } from './backup-restore/backup-restore.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      serveRoot: '/static'
    }),
    CacheModule.register({ ttl: 30000, isGlobal: true, max: 1000 }),
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    DbModule, AccountModule, AccountGroupModule, CameraModule,
    CameraGroupModule, StreamModule, RecorderModule, CameraServiceModule,
    CameraRecorderModule, CameraPlaybackModule, AssignModule, SettingsModule,
    LoggerModule, PlaybackModule, SchedulerModule, BookmarkModule, LicenseModule,
    LprServiceModule, LprQueueModule, LprModule, LprResultsModule, LprListModule,
    DevicesModule, OperationsModule, MismatchServiceModule, MismatchModule, TileviewModule, TilelayoutModule, OnvifModule,
    WebhookModule, WorkersModule, StorageModule, BackupRestoreModule],
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
