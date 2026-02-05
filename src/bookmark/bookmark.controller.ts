import { Controller, Get, Post, Body, Param, Delete, UseGuards, ParseUUIDPipe, Query } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import * as dtos from './bookmark.dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';
import { generalResponse } from 'src/app.consts';

@ApiBearerAuth()
@ApiTags('13. bookmark')
@Controller('bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get(':camera_id')
  @AccountRoles('bookmark_list')
  @UseGuards(AccountGuard)
  async get_list(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string, @Query() query: dtos.bookmarkSearchQuery): Promise<generalResponse> {
    return this.bookmarkService.get_list(user, camera_id, query);
  }

  @Post(':camera_id')
  @AccountRoles('bookmark_add')
  @UseGuards(AccountGuard)
  async add_item(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string, @Body() body: dtos.bookmarkDto): Promise<generalResponse> {
    return this.bookmarkService.add_item(user, camera_id, body);
  }

  @Get(':camera_id/:bookmark_id')
  @AccountRoles('bookmark_list')
  @UseGuards(AccountGuard)
  async get_item(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string , @Param('bookmark_id', new ParseUUIDPipe({ version: "4" })) bookmark_id: string): Promise<generalResponse> {
    return this.bookmarkService.get_item(user, camera_id, bookmark_id);
  }

  @Delete(':camera_id/:bookmark_id')
  @AccountRoles('bookmark_delete')
  @UseGuards(AccountGuard)
  async delete_item(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string , @Param('bookmark_id', new ParseUUIDPipe({ version: "4" })) bookmark_id: string): Promise<generalResponse> {
    return this.bookmarkService.delete_item(user, camera_id, bookmark_id);
  }
}
