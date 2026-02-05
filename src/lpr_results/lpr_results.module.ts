import { Module } from '@nestjs/common';
import { LprResultsService } from './lpr_results.service';
import { LprResultsController } from './lpr_results.controller';
import { DbModule } from 'src/db/db.module';
import { StorageModule } from 'src/storage/storage.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [DbModule, LoggerModule, StorageModule],
  controllers: [LprResultsController],
  providers: [LprResultsService],
})
export class LprResultsModule {}
