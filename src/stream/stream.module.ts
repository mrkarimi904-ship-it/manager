import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'src/logger/logger.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [DbModule, HttpModule, LoggerModule, EventEmitterModule],
  providers: [StreamService],
  controllers: [StreamController],
  exports: [StreamService]
})
export class StreamModule {}
