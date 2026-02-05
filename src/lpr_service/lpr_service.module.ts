import { Module } from '@nestjs/common';
import { LprServiceService } from './lpr_service.service';
import { LprServiceController } from './lpr_service.controller';
import { DbModule } from 'src/db/db.module';
import { StreamModule } from 'src/stream/stream.module';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'src/logger/logger.module';
import { LprModule } from 'src/lpr/lpr.module';
import { LicenseModule } from 'src/license/license.module';

@Module({
  imports: [DbModule, StreamModule, HttpModule, LoggerModule, LprModule, LicenseModule],
  providers: [LprServiceService],
  controllers: [LprServiceController],
  exports: [LprServiceService]
})
export class LprServiceModule {}
