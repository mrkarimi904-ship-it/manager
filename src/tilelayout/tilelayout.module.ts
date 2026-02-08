import { Module } from '@nestjs/common';
import { TilelayoutController } from './tilelayout.controller';
import { TilelayoutService } from './tilelayout.service';
import { DbModule } from 'src/db/db.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [DbModule, LoggerModule],
  controllers: [TilelayoutController],
  providers: [TilelayoutService]
})
export class TilelayoutModule {}
