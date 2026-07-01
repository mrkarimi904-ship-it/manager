import { Module } from '@nestjs/common';
import { BackupRestoreService } from './backup-restore.service';
import { BackupRestoreController } from './backup-restore.controller';
import { DbModule } from 'src/db/db.module';
import { StorageModule } from 'src/storage/storage.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [DbModule, StorageModule, LoggerModule],
  controllers: [BackupRestoreController],
  providers: [BackupRestoreService],
  exports: [BackupRestoreService],
})
export class BackupRestoreModule {}
