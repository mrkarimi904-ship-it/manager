import { Module } from '@nestjs/common';
import { LprService } from './lpr.service';
import { LprController } from './lpr.controller';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';
import { StreamModule } from 'src/stream/stream.module';
import { LicenseModule } from 'src/license/license.module';

@Module({
  imports: [DbModule, HttpModule, StreamModule, LicenseModule],
  controllers: [LprController],
  providers: [LprService],
  exports: [LprService]
})
export class LprModule {}
