import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerGateway } from './logger.gateway';
import { DbModule } from 'src/db/db.module';
import { LoggerController } from './logger.controller';

@Module({
  imports: [DbModule],
  controllers: [LoggerController],
  providers: [LoggerGateway, LoggerService],
  exports: [LoggerGateway, LoggerService]
})
export class LoggerModule {}
