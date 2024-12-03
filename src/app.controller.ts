import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AccountRoles, User } from './account/account.decorator';
import { accountGaurd } from './account/account.gaurd';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }

  @Get('self')
  @AccountRoles()
  @UseGuards(accountGaurd)
  getMe(@User() user) {
    return { expired: user.expired, firstname: user.firstname, lastname: user.lastname, mustchangepassword: user.mustchangepassword, username: user.username };
  }
}
