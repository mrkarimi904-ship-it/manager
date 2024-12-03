import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, Response, UseGuards } from '@nestjs/common';

import { AccountService } from './account.service';

import { editDto, PasswordDto, signUpDto, singInDto, accountSearchQuery } from './account.dto';

import { generalResponse } from 'src/app.consts';
import { AccountRoles, User, Token } from './account.decorator';
import { accountGaurd } from './account.gaurd';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('01. user')
@Controller('user')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async allAccounts(@User() user, @Query() query: accountSearchQuery): Promise<generalResponse> {
    return await this.accountService.allAccounts(user, query);
  }

  @Get(':id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async getAccount(@Param('id') id: string): Promise<generalResponse> {
    return await this.accountService.getAccount(id);
  }

  @Get(':id/tokens')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async getAccountTokens(@Param('id') id: string, @Token() token): Promise<generalResponse> {
    return await this.accountService.getAccountTokens(id, token);
  }

  @Delete(':id/tokens/:token_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async deleteAccountTokens(@Param('id') id: string, @Param('token_id') token_id: string): Promise<generalResponse> {
    return await this.accountService.deleteAccountTokens(id, token_id);
  }

  @Put(':id')
  @AccountRoles('account_edit')
  @UseGuards(accountGaurd)
  async putAccount(@User() user, @Body() body: editDto, @Param('id') id: string): Promise<generalResponse> {
    return await this.accountService.putAccount(id, body, user);
  }

  @Put(':id/expire')
  @AccountRoles('account_edit')
  @UseGuards(accountGaurd)
  async putAccountExpire(@User() user, @Param('id') id: string): Promise<generalResponse> {
    return await this.accountService.putAccountExpire(id, user);
  }

  @Delete(':id')
  @AccountRoles('account_delete')
  @UseGuards(accountGaurd)
  async deleteAccount(@Param('id') id: string): Promise<generalResponse> {
    return await this.accountService.deleteAccount(id);
  }

  @Post('')
  @AccountRoles('account_add')
  @UseGuards(accountGaurd)
  async signUp(@User() user,@Body() body: signUpDto): Promise<generalResponse> {
    const output = await this.accountService.signUp(body, user);
    return output;
  }

  @Get('/access/verify')
  async verifyToken(@Headers() req, @Response() res) {
    const output: any = await this.accountService.verifyToken(req);
    res.set('X-User_ID', output);
    return res.send(output);
  }

  @Post('/access/login')
  async signIn(@Body() body: singInDto): Promise<generalResponse> {
    return await this.accountService.signIn(body)
  }

  @Post('/access/reset')
  async changePass(@Body() body: PasswordDto): Promise<generalResponse> {
    return await this.accountService.changePass(body)
  }

  @Get('/access/roles')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async allRoles(): Promise<generalResponse> {
    return await this.accountService.allRoles();
  }

}
