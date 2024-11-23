import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Response, UseGuards } from '@nestjs/common';

import { AccountService } from './account.service';

import { editDto, signUpDto, singInDto } from './account.dto';

import { generalResponse } from 'src/app.consts';
import { AccountRoles, User, Token } from './account.decorator';
import { accountGaurd } from './account.gaurd';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @AccountRoles()
  @UseGuards(accountGaurd)
  getMe(@User() user) {
    return user;
  }

  @Get('all')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async allAccounts(): Promise<generalResponse> {
    return await this.accountService.allAccounts();
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

  @Delete(':id/tokens/:tid')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async deleteAccountTokens(@Param('id') id: string, @Param('tid') tid: string): Promise<generalResponse> {
    return await this.accountService.deleteAccountTokens(id, tid);
  }

  @Put(':id')
  @AccountRoles('account_edit')
  @UseGuards(accountGaurd)
  async putAccount(@Body() body: editDto, @Param('id') id: string): Promise<generalResponse> {
    return await this.accountService.putAccount(id, body);
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
  async signUp(@Body() body: signUpDto): Promise<generalResponse> {
    const output = await this.accountService.signUp(body);
    return output;
  }

  @Post('/access')
  async signIn(@Body() body: singInDto): Promise<generalResponse> {
    return await this.accountService.signIn(body)
  }

  @Get('/access/verify')
  async verifyToken(@Headers() req, @Response() res) {
    const output: any = await this.accountService.verifyToken(req);
    res.set('X-User_ID', output);
    return res.send(output);
  }

  @Get('access/roles')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async allRoles(): Promise<generalResponse> {
    return await this.accountService.allRoles();
  }

  @Get('access/groups')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async allGroups(): Promise<generalResponse> {
    return await this.accountService.allGroups();
  }

  @Post('access/groups')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async postGroups(@Body() body): Promise<generalResponse> {
    return await this.accountService.postGroups(body);
  }

  @Get('access/groups/:id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async getGroups(@Param('id') id: string): Promise<generalResponse> {
    return await this.accountService.getGroups(id);
  }

  @Put('access/groups/:id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async putGroups(@Param('id') id: string, @Body() body): Promise<generalResponse> {
    return await this.accountService.putGroups(id, body);
  }

  @Delete('access/groups/:id')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async deleteGroups(@Param('id') id: string): Promise<generalResponse> {
    return await this.accountService.deleteGroups(id);
  }

  @Post('access/groups/:id/role/:rid')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async postGroupsRoles(@Param('id') id: string,@Param('rid') rid: string): Promise<generalResponse> {
    return await this.accountService.postGroupsRoles(id, rid);
  }

  @Delete('access/groups/:id/role/:rid')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async deleteGroupsRoles(@Param('id') id: string, @Param('rid') rid: string): Promise<generalResponse> {
    return await this.accountService.deleteGroupsRoles(id, rid);
  }

  @Post('access/groups/:id/account/:rid')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async postGroupsUser(@Param('id') id: string,@Param('rid') rid: string): Promise<generalResponse> {
    return await this.accountService.postGroupsUser(id, rid);
  }

  @Delete('access/groups/:id/account/:rid')
  @AccountRoles('account_list')
  @UseGuards(accountGaurd)
  async deleteGroupsUser(@Param('id') id: string, @Param('rid') rid: string): Promise<generalResponse> {
    return await this.accountService.deleteGroupsUser(id, rid);
  }
}
