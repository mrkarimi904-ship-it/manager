import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerGateway } from './logger.gateway';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  providers: [LoggerGateway, LoggerService],
  exports: [LoggerGateway]
})
export class LoggerModule {}
