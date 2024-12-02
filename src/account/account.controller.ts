import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, Response, UseGuards } from '@nestjs/common';

import { AccountService } from './account.service';

import { editDto, PasswordDto, signUpDto, singInDto, accountSearchQuery, nameDto, groupSearchQuery } from './account.dto';

import { generalResponse } from 'src/app.consts';
import { AccountRoles, User, Token } from './account.decorator';
import { accountGaurd } from './account.gaurd';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('')
  @AccountRoles()
  @UseGuards(accountGaurd)
  getMe(@User() user) {
    return { expired: user.expired, firstname: user.firstname, lastname: user.lastname, mustchangepassword: user.mustchangepassword, username: user.username };
  }

  @Get('users')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async allAccounts(@User() user, @Query() query: accountSearchQuery): Promise<generalResponse> {
    return await this.accountService.allAccounts(user, query);
  }

  @Get('users/:id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async getAccount(@Param('id') id: string): Promise<generalResponse> {
    return await this.accountService.getAccount(id);
  }

  @Get('users/:id/tokens')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async getAccountTokens(@Param('id') id: string, @Token() token): Promise<generalResponse> {
    return await this.accountService.getAccountTokens(id, token);
  }

  @Delete('users/:id/tokens/:token_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async deleteAccountTokens(@Param('id') id: string, @Param('token_id') token_id: string): Promise<generalResponse> {
    return await this.accountService.deleteAccountTokens(id, token_id);
  }

  @Put('users/:id')
  @AccountRoles('account_edit')
  @UseGuards(accountGaurd)
  async putAccount(@User() user, @Body() body: editDto, @Param('id') id: string): Promise<generalResponse> {
    return await this.accountService.putAccount(id, body, user);
  }

  @Put('users/:id/expire')
  @AccountRoles('account_edit')
  @UseGuards(accountGaurd)
  async putAccountExpire(@User() user, @Param('id') id: string): Promise<generalResponse> {
    return await this.accountService.putAccountExpire(id, user);
  }

  @Delete('users/:id')
  @AccountRoles('account_delete')
  @UseGuards(accountGaurd)
  async deleteAccount(@Param('id') id: string): Promise<generalResponse> {
    return await this.accountService.deleteAccount(id);
  }

  @Post('users/')
  @AccountRoles('account_add')
  @UseGuards(accountGaurd)
  async signUp(@User() user,@Body() body: signUpDto): Promise<generalResponse> {
    const output = await this.accountService.signUp(body, user);
    return output;
  }

  @Get('/access')
  async verifyToken(@Headers() req, @Response() res) {
    const output: any = await this.accountService.verifyToken(req);
    res.set('X-User_ID', output);
    return res.send(output);
  }

  @Post('/access')
  async signIn(@Body() body: singInDto): Promise<generalResponse> {
    return await this.accountService.signIn(body)
  }

  @Post('/access/reset')
  async changePass(@Body() body: PasswordDto): Promise<generalResponse> {
    return await this.accountService.changePass(body)
  }

  @Get('roles')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async allRoles(): Promise<generalResponse> {
    return await this.accountService.allRoles();
  }

  @Get('groups')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async allGroups(@User() user, @Query() query: groupSearchQuery): Promise<generalResponse> {
    return await this.accountService.allGroups(user, query);
  }

  @Post('groups')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async postGroups(@Body() body: nameDto): Promise<generalResponse> {
    return await this.accountService.postGroups(body);
  }

  @Get('groups/:group_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async getGroups(@Param('group_id') group_id: string): Promise<generalResponse> {
    return await this.accountService.getGroups(group_id);
  }

  @Put('groups/:group_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async putGroups(@Param('group_id') group_id: string, @Body() body: nameDto): Promise<generalResponse> {
    return await this.accountService.putGroups(group_id, body);
  }

  @Delete('groups/:group_id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async deleteGroups(@Param('group_id') group_id: string): Promise<generalResponse> {
    return await this.accountService.deleteGroups(group_id);
  }

}
