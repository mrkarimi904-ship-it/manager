import { Controller, Get, Post, Body, UseGuards, Param, ParseUUIDPipe, Put, Delete, Query } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { CreateOperationDto, UpdateOperationDto, operationSearchQuery } from './operations.dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles, User } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';
import { generalResponse } from 'src/app.consts';

@ApiBearerAuth()
@ApiTags('16. operations')
@Controller('lpr_list/:lprListId/operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post()
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async create(@User() user, @Param('lprListId', new ParseUUIDPipe({ version: "4" })) lprListId: string, @Body() createOperationDto: CreateOperationDto): Promise<generalResponse> {
    createOperationDto.lpr_list_id = lprListId;
    return this.operationsService.create(createOperationDto, user);
  }

  @Get()
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async findAll(@User() user, @Param('lprListId', new ParseUUIDPipe({ version: "4" })) lprListId: string, @Query() query: operationSearchQuery): Promise<generalResponse> {
    return this.operationsService.findByLprList(lprListId, user);
  }

  @Get(':id')
  @AccountRoles('camera_list')
  @UseGuards(AccountGuard)
  async getSingle(@User() user, @Param('lprListId', new ParseUUIDPipe({ version: "4" })) lprListId: string, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.operationsService.getSingle(user, id);
  }

  @Put(':id')
  @AccountRoles('camera_edit')
  @UseGuards(AccountGuard)
  async putSingle(@User() user, @Param('lprListId', new ParseUUIDPipe({ version: "4" })) lprListId: string, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string, @Body() body: UpdateOperationDto): Promise<generalResponse> {
    return this.operationsService.putSingle(id, body, user);
  }

  @Delete(':id')
  @AccountRoles('camera_delete')
  @UseGuards(AccountGuard)
  async deleteSingle(@User() user, @Param('lprListId', new ParseUUIDPipe({ version: "4" })) lprListId: string, @Param('id', new ParseUUIDPipe({ version: "4" })) id: string): Promise<generalResponse> {
    return this.operationsService.deleteSingle(user, id);
  }
}
