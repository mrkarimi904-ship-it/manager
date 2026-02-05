import { Module } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { DevicesModule } from 'src/devices/devices.module';
import { DbModule } from 'src/db/db.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [DevicesModule, DbModule, LoggerModule],
  controllers: [OperationsController],
  providers: [OperationsService],
  exports: [OperationsService]
})
export class OperationsModule {}
