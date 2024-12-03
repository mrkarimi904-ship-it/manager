import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { DbModule } from 'src/db/db.module';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  imports: [DbModule, SettingsModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
