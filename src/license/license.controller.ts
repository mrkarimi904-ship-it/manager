import { Controller, Get, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { LicenseService } from './license.service';
import { generalResponse } from 'src/app.consts';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { accountGaurd } from 'src/account/account.gaurd';

@ApiBearerAuth()
@ApiTags('16. License')
@Controller('license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get('')
  @AccountRoles('license')
  @UseGuards(accountGaurd)
  async getLicense(@User() user): Promise<generalResponse> {
    return await this.licenseService.getLicense()
  }

  @Post('')
  @AccountRoles('license')
  @UseGuards(accountGaurd)
  async verifyLicense(@User() user, @Body() body: { licenseKey: string }): Promise<generalResponse>  {
    return this.licenseService.verifyLicense(body.licenseKey);
  }

  @Delete('')
  @AccountRoles('license')
  @UseGuards(accountGaurd)
  async deleteLicense(@User() user): Promise<generalResponse>  {
    return this.licenseService.deleteLicense();
  }

  @Post('generate')
  @AccountRoles('license')
  @UseGuards(accountGaurd)
  async generateLicense(@User() user, @Body() payload: any): Promise<generalResponse> {
    return await this.licenseService.generateLicense(payload);
  }

}