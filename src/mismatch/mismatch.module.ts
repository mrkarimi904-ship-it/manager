import { Module } from '@nestjs/common';
import { MismatchController } from './mismatch.controller';
import { MismatchService } from './mismatch.service';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';
import { StreamModule } from 'src/stream/stream.module';

@Module({
  imports: [DbModule, HttpModule, StreamModule],
  providers: [MismatchService],
  controllers: [MismatchController],
  exports: [MismatchService]
})
export class MismatchModule {}
