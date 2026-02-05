import { Module } from '@nestjs/common';
import { MismatchServiceService } from './mismatch_service.service';
import { MismatchServiceController } from './mismatch_service.controller';
import { DbModule } from 'src/db/db.module';
import { StreamModule } from 'src/stream/stream.module';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'src/logger/logger.module';
import { MismatchModule } from 'src/mismatch/mismatch.module';

@Module({
  imports: [DbModule, StreamModule, HttpModule, LoggerModule, MismatchModule],
  providers: [MismatchServiceService],
  controllers: [MismatchServiceController],
  exports: [MismatchServiceService]
})
export class MismatchServiceModule {}
