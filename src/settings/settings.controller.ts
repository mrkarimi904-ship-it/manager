import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import * as dtos from './dtos';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';
import { generalResponse } from 'src/app.consts';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('15. settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('PasswordComplexities')
  async getPasswordComplexities(@User() user): Promise<generalResponse> {
    return await this.settingsService.getPasswordComplexities(user);
  }

  @Put('PasswordComplexities')
  @AccountRoles('settings_password')
  @UseGuards(AccountGuard)
  async setPasswordComplexities(@User() user, @Body() updateSettingDto: dtos.passwordComplexityDto): Promise<generalResponse> {
    return await this.settingsService.setPasswordComplexities(user, updateSettingDto);
  }

  @Get('BackupRestore')
  @AccountRoles('license')
  @UseGuards(AccountGuard)
  async getBackupRestoreSettings(@User() user): Promise<generalResponse> {
    return await this.settingsService.getBackupRestoreSettings(user);
  }

  @Put('BackupRestore')
  @AccountRoles('license')
  @UseGuards(AccountGuard)
  async setBackupRestoreSettings(@User() user, @Body() body: any): Promise<generalResponse> {
    return await this.settingsService.setBackupRestoreSettings(user, body);
  }

}
