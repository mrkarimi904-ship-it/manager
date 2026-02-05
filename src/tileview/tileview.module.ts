import { Module } from '@nestjs/common';
import { TileviewController } from './tileview.controller';
import { TileviewService } from './tileview.service';
import { DbModule } from 'src/db/db.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [DbModule, LoggerModule],
  controllers: [TileviewController],
  providers: [TileviewService]
})
export class TileviewModule {}

