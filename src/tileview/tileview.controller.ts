import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';

import { TileviewService } from './tileview.service';

import { tileviewDto, tileviewEditDto, tileviewSearchQuery } from './tileview.dto';

import { generalResponse } from 'src/app.consts';
import { AccountRoles, User } from '../account/account.decorator';
import { AccountGuard } from '../account/account.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('tileview')
@Controller('tileview')
export class TileviewController {
  constructor(private readonly tileviewService: TileviewService) {}

  @Get('')
  @UseGuards(AccountGuard)
  async allTileviews(@User() user, @Query() query: tileviewSearchQuery): Promise<generalResponse> {
    return await this.tileviewService.allTileviews(user, query);
  }

  @Post('')
  @AccountRoles('tileview_add')
  @UseGuards(AccountGuard)
  async postTileview(@User() user, @Body() body: tileviewDto): Promise<generalResponse> {
    return await this.tileviewService.postTileview(user, body);
  }

  @Get(':id')
  @UseGuards(AccountGuard)
  async getTileview(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return await this.tileviewService.getTileview(id, user);
  }

  @Put(':id')
  @AccountRoles('tileview_edit')
  @UseGuards(AccountGuard)
  async putTileview(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() body: tileviewEditDto): Promise<generalResponse> {
    return await this.tileviewService.putTileview(user, id, body);
  }

  @Delete(':id')
  @UseGuards(AccountGuard)
  async deleteTileview(@User() user, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return await this.tileviewService.deleteTileview(user, id);
  }

}

