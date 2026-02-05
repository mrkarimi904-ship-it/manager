import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountGuard } from './account.guard';
import { DbModule } from 'src/db/db.module';
import { SettingsModule } from 'src/settings/settings.module';
import { LoggerModule } from 'src/logger/logger.module';
import { SchedulerModule } from 'src/scheduler/scheduler.module';
import { LicenseModule } from 'src/license/license.module';

@Module({
  imports: [DbModule, SettingsModule, LoggerModule, SchedulerModule, LicenseModule],
  controllers: [AccountController],
  providers: [AccountService, AccountGuard],
  exports: [AccountService, AccountGuard]
})
export class AccountModule {}
