import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { LprService } from './lpr.service';
import * as dtos from './lpr.dto';
import { generalResponse } from 'src/app.consts';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';

@ApiBearerAuth()
@ApiTags('09. lpr')
@Controller('lpr')
export class LprController {
  constructor(private readonly lprService: LprService) {}

  @Get(':camera_id')
  @AccountRoles('actions_live')
  @UseGuards(AccountGuard)
  findAll(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string): Promise<generalResponse> {
    return this.lprService.findAll(user, camera_id);
  }

  @Post(':camera_id')
  @AccountRoles('actions_live')
  @UseGuards(AccountGuard)
  create(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string, @Body() createLprDto: dtos.CreateLprDto): Promise<generalResponse> {
    return this.lprService.create(user, camera_id, createLprDto);
  }

  @Get(':camera_id/:lpr_id')
  @AccountRoles('actions_live')
  @UseGuards(AccountGuard)
  findOne(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string, @Param('lpr_id', new ParseUUIDPipe({ version: "4" })) lpr_id: string): Promise<generalResponse> {
    return this.lprService.findOne(user, camera_id, lpr_id);
  }

  @Put(':camera_id/:lpr_id')
  @AccountRoles('actions_live')
  @UseGuards(AccountGuard)
  update(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string, @Param('lpr_id', new ParseUUIDPipe({ version: "4" })) lpr_id: string, @Body() createLprDto: dtos.UpdateLprDto): Promise<generalResponse> {
    return this.lprService.update(user, camera_id, lpr_id, createLprDto);
  }

  @Delete(':camera_id/:lpr_id')
  @AccountRoles('actions_live')
  @UseGuards(AccountGuard)
  remove(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string, @Param('lpr_id', new ParseUUIDPipe({ version: "4" })) lpr_id: string): Promise<generalResponse> {
    return this.lprService.remove(user, camera_id, lpr_id);
  }

  @Post(':camera_id/:lpr_id/start')
  @AccountRoles('actions_live')
  @UseGuards(AccountGuard)
  start(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string, @Param('lpr_id', new ParseUUIDPipe({ version: "4" })) lpr_id: string): Promise<generalResponse> {
    return this.lprService.start(user, camera_id, lpr_id);
  }

  @Post(':camera_id/:lpr_id/stop')
  @AccountRoles('actions_live')
  @UseGuards(AccountGuard)
  stop(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string, @Param('lpr_id', new ParseUUIDPipe({ version: "4" })) lpr_id: string): Promise<generalResponse> {
    return this.lprService.stop(user, camera_id, lpr_id);
  }

  @Get(':camera_id/:lpr_id/roi')
  @AccountRoles('actions_live')
  @UseGuards(AccountGuard)
  getRoi(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string, @Param('lpr_id', new ParseUUIDPipe({ version: "4" })) lpr_id: string): Promise<generalResponse> {
    return this.lprService.getRoi(user, camera_id, lpr_id);
  }

  @Post(':camera_id/:lpr_id/roi')
  @AccountRoles('actions_live')
  @UseGuards(AccountGuard)
  postRoi(@User() user, @Param('camera_id', new ParseUUIDPipe({ version: "4" })) camera_id: string, @Param('lpr_id', new ParseUUIDPipe({ version: "4" })) lpr_id: string,  @Body() body: any): Promise<generalResponse> {
    return this.lprService.postRoi(user, camera_id, lpr_id, body);
  }

}
