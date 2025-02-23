import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { DbModule } from 'src/db/db.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [DbModule, LoggerModule],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService]
})
export class SchedulerModule {}
