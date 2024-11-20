import { Module } from '@nestjs/common';
import { LiveService } from './live.service';
import { LiveController } from './live.controller';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DbModule, HttpModule],
  providers: [LiveService],
  controllers: [LiveController],
  exports: [LiveService]
})
export class LiveModule {}
