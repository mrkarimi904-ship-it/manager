import { Module } from '@nestjs/common';
import { LprListService } from './lpr_list.service';
import { LprListController } from './lpr_list.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [LprListController],
  providers: [LprListService],
})
export class LprListModule {}
