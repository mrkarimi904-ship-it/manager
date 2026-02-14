import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';

import { TilelayoutService } from './tilelayout.service';

import { tilelayoutDto, tilelayoutEditDto, tilelayoutSearchQuery } from './tilelayout.dto';

import { generalResponse } from 'src/app.consts';
import { AccountRoles, User } from '../account/account.decorator';
import { AccountGuard } from '../account/account.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('tilelayout')
@Controller('tilelayout')
export class TilelayoutController {
  constructor(private readonly tilelayoutService: TilelayoutService) {}

  @Get('')
  @UseGuards(AccountGuard)
  async allTilelayouts(@User() user, @Query() query: tilelayoutSearchQuery): Promise<generalResponse> {
    return await this.tilelayoutService.allTilelayouts(user, query);
  }

  @Post('')
  @AccountRoles('client_manage_layout')
  @UseGuards(AccountGuard)
  async postTilelayout(@User() user, @Body() body: tilelayoutDto): Promise<generalResponse> {
    return await this.tilelayoutService.postTilelayout(user, body);
  }

  @Get(':id')
  @UseGuards(AccountGuard)
  async getTilelayout(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return await this.tilelayoutService.getTilelayout(id, user);
  }

  @Put(':id')
  @AccountRoles('client_manage_layout')
  @UseGuards(AccountGuard)
  async putTilelayout(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() body: tilelayoutEditDto): Promise<generalResponse> {
    return await this.tilelayoutService.putTilelayout(user, id, body);
  }

  @Delete(':id')
  @AccountRoles('client_manage_layout')
  @UseGuards(AccountGuard)
  async deleteTilelayout(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return await this.tilelayoutService.deleteTilelayout(user, id);
  }
}
