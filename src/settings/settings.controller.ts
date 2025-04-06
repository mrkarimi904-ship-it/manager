import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import * as dtos from './dtos';
import { AccountRoles, User } from 'src/account/account.decorator';
import { accountGaurd } from 'src/account/account.gaurd';
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
  @UseGuards(accountGaurd)
  async setPasswordComplexities(@User() user, @Body() updateSettingDto: dtos.passwordComplexityDto): Promise<generalResponse> {
    return await this.settingsService.setPasswordComplexities(user, updateSettingDto);
  }

}
