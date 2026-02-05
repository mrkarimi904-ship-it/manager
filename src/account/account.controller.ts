import { Body, Controller, Delete, Get, Headers, Param, ParseUUIDPipe, Post, Put, Query, Response, UseGuards } from '@nestjs/common';

import { AccountService } from './account.service';

import { editDto, PasswordDto, signUpDto, singInDto, accountSearchQuery, roleSearchQuery, preferenceDto } from './account.dto';

import { generalResponse } from 'src/app.consts';
import { AccountRoles, User, Token } from './account.decorator';
import { AccountGuard } from './account.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('01. user')
@Controller('user')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('')
  @AccountRoles('account_list')
  @UseGuards(AccountGuard)
  async allAccounts(@User() user, @Query() query: accountSearchQuery): Promise<generalResponse> {
    return await this.accountService.allAccounts(user, query);
  }

  @Get(':id')
  @AccountRoles('account_list')
  @UseGuards(AccountGuard)
  async getAccount(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return await this.accountService.getAccount(id);
  }

  @Get(':id/role')
  @AccountRoles('account_list')
  @UseGuards(AccountGuard)
  async getAccountRoles(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return await this.accountService.getAccountRoles(id);
  }

  @Get(':id/tokens')
  @AccountRoles()
  @UseGuards(AccountGuard)
  async getAccountTokens(@Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Token() token): Promise<generalResponse> {
    return await this.accountService.getAccountTokens(id, token);
  }

  @Delete(':id/tokens/:token_id')
  @AccountRoles()
  @UseGuards(AccountGuard)
  async deleteAccountTokens(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Param('token_id', new ParseUUIDPipe({ version: "4" })) token_id: string): Promise<generalResponse> {
    return await this.accountService.deleteAccountTokens(user, id, token_id);
  }

  @Put(':id')
  @AccountRoles('account_edit')
  @UseGuards(AccountGuard)
  async putAccount(@User() user, @Body() body: editDto, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return await this.accountService.putAccount(id, body, user);
  }

  @Put(':id/expire')
  @AccountRoles('account_edit')
  @UseGuards(AccountGuard)
  async putAccountExpire(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return await this.accountService.putAccountExpire(id, user);
  }

  @Get(':id/totp')
  @AccountRoles()
  @UseGuards(AccountGuard)
  async getAccountTotp(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return await this.accountService.getAccountTotp(id, user);
  }

  @Put(':id/totp')
  @AccountRoles()
  @UseGuards(AccountGuard)
  async putAccountTotp(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return await this.accountService.putAccountTotp(id, user);
  }

  @Post(':id/generate_password')
  @AccountRoles('account_edit')
  @UseGuards(AccountGuard)
  async generate_password(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return await this.accountService.generate_password(user, id)
  }

  @Delete(':id')
  @AccountRoles('account_delete')
  @UseGuards(AccountGuard)
  async deleteAccount(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return await this.accountService.deleteAccount(user, id);
  }

  @Post('')
  @AccountRoles('account_add')
  @UseGuards(AccountGuard)
  async signUp(@User() user,@Body() body: signUpDto): Promise<generalResponse> {
    return await this.accountService.signUp(body, user);
  }

  @Get('/access/verify')
  async verifyToken(@Headers() req, @Response() res) {
    const output: any = await this.accountService.verifyToken(req);
    res.set('X-User_ID', output);
    return res.send(output);
  }

  @Post('/access/login')
  async signIn(@Headers() req, @Body() body: singInDto): Promise<generalResponse> {
    return await this.accountService.signIn(req, body)
  }

  @Post('/access/reset')
  async changePass(@Headers() req, @Body() body: PasswordDto): Promise<generalResponse> {
    return await this.accountService.changePass(req, body)
  }

  @Post('/access/logout')
  @AccountRoles()
  @UseGuards(AccountGuard)
  async signOut(@Headers() req, @User() user,): Promise<generalResponse> {
    return await this.accountService.signOut(req, user)
  }


  @Get('/access/roles')
  @AccountRoles('account_list')
  @UseGuards(AccountGuard)
  async allRoles(@User() user, @Query() query: roleSearchQuery): Promise<generalResponse> {
    return await this.accountService.allRoles(user, query);
  }

  @Get('/preference/all')
  @AccountRoles()
  @UseGuards(AccountGuard)
  async getPreferences(@User() user): Promise<generalResponse> {
    return await this.accountService.getPreferences(user);
  }

  @Get('/preference/:key')
  @AccountRoles()
  @UseGuards(AccountGuard)
  async getPreference(@User() user, @Param('key') key: string): Promise<generalResponse> {
    return await this.accountService.getPreference(key, user);
  }

  @Put('/preference/:key')
  @AccountRoles()
  @UseGuards(AccountGuard)
  async putPreference(@User() user, @Param('key') key: string, @Body() body: preferenceDto): Promise<generalResponse> {
    return await this.accountService.putPreference(key, user, body);
  }

  @Delete('/preference/:key')
  @AccountRoles('account_delete')
  @UseGuards(AccountGuard)
  async deletePreference(@User() user, @Param('key') key: string): Promise<generalResponse> {
    return await this.accountService.deletePreference(key, user);
  }

  @Post('/preference')
  @AccountRoles('account_delete')
  @UseGuards(AccountGuard)
  async postPreference(@User() user, @Body() body: preferenceDto): Promise<generalResponse> {
    return await this.accountService.postPreference(user, body)
  }

}
