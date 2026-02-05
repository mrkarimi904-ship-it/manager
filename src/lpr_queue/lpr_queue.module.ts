import { Module } from '@nestjs/common';
import { LprQueueService } from './lpr_queue.service';
import { LprQueueController } from './lpr_queue.controller';
import { DbModule } from 'src/db/db.module';
import { OperationsModule } from 'src/operations/operations.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [DbModule, OperationsModule, StorageModule],
  controllers: [LprQueueController],
  providers: [LprQueueService],
  exports: [LprQueueService]
})
export class LprQueueModule {}
