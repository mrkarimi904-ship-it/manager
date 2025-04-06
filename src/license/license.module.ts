import { Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { DbModule } from 'src/db/db.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [DbModule, LoggerModule],
  controllers: [LicenseController],
  providers: [LicenseService],
  exports: [LicenseService]
})
export class LicenseModule {}
