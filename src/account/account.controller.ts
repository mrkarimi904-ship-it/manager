import { Body, Controller, Get, Headers, Post, Res, Response, UseGuards } from '@nestjs/common';

import { AccountService } from './account.service';

import { signUpDto, singInDto } from './account.dto';

import { generalResponse } from 'src/app.consts';
import { AccountRoles, User } from './account.decorator';
import { accountGaurd } from './account.gaurd';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('account')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @AccountRoles()
  @UseGuards(accountGaurd)
  getAccount(@User() user) {
    return user;
  }

  @Get('all')
  @AccountRoles('list_accounts')
  @UseGuards(accountGaurd)
  async allAccounts(): Promise<generalResponse> {
    return await this.accountService.allAccounts();
  }

  @Post('/signup')
  async signUp(@Body() body: signUpDto, @Res({ passthrough: true }) res: Response): Promise<generalResponse> {
    const output = await this.accountService.signUp(body);
    return output;
  }

  @Post('/signin')
  async signIn(@Body() body: singInDto, @Res({ passthrough: true }) res: Response): Promise<generalResponse> {
    return await this.accountService.signIn(body)
  }

  @Get('/verify')
  async verifyToken(@Headers() req, @Response() res) {
    const output: any = await this.accountService.verifyToken(req);
    res.set('X-User_ID', output);
    return res.send(output);
  }
}
