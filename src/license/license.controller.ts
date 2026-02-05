import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { LicenseService } from './license.service';
import { generalResponse } from 'src/app.consts';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';
import { licenseGenerateDto, licensePostDto } from './license.dtos';

@ApiBearerAuth()
@ApiTags('16. License')
@Controller('license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get('get')
  @AccountRoles('license')
  @UseGuards(AccountGuard)
  async getLicense(@User() user): Promise<generalResponse> {
    return await this.licenseService.getLicense();
  }

  @Get('code')
  @AccountRoles('license')
  @UseGuards(AccountGuard)
  async getLicenseCode(@User() user): Promise<generalResponse> {
    return await this.licenseService.getLicenseCode();
  }

  @Post('')
  @AccountRoles('license')
  @UseGuards(AccountGuard)
  async verifyLicense(@User() user, @Body() body: licensePostDto): Promise<generalResponse> {
    return this.licenseService.verifyLicense(body);
  }

  @Delete('')
  @AccountRoles('license')
  @UseGuards(AccountGuard)
  async deleteLicense(@User() user): Promise<generalResponse> {
    return await this.licenseService.deleteLicense();
  }

  // @Post('generate')
  // @AccountRoles('license')
  // @UseGuards(AccountGuard)
  // async generateLicense(@User() user, @Body() body: licenseGenerateDto): Promise<generalResponse> {
  //   return await this.licenseService.generateLicense(body);
  // }
}
