import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DbModule, HttpModule],
  providers: [StreamService],
  controllers: [StreamController],
  exports: [StreamService]
})
export class StreamModule {}
