import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { DbModule } from 'src/db/db.module';
import { SettingsModule } from 'src/settings/settings.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [DbModule, SettingsModule, LoggerModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService]
})
export class AccountModule {}
