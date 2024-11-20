import { Module } from '@nestjs/common';
import { RecorderService } from './recorder.service';
import { RecorderController } from './recorder.controller';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DbModule, HttpModule],
  providers: [RecorderService],
  controllers: [RecorderController],
  exports: [RecorderService]
})
export class RecorderModule {}
