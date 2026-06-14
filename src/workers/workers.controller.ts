import { Controller, Delete, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';
import { generalResponse } from 'src/app.consts';
import { WorkersService } from './workers.service';

@ApiBearerAuth()
@ApiTags('workers')
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Get()
  @AccountRoles('license')
  @UseGuards(AccountGuard)
  async getAll(): Promise<generalResponse> {
    return this.workersService.getAll();
  }

  @Get(':type/:id/assignments')
  @AccountRoles('license')
  @UseGuards(AccountGuard)
  async getAssignments(
    @Param('type') type: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<generalResponse> {
    return this.workersService.getAssignments(type, id);
  }

  @Delete(':type/:id')
  @AccountRoles('license')
  @UseGuards(AccountGuard)
  async deleteWorker(
    @Param('type') type: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<generalResponse> {
    return this.workersService.deleteWorker(type, id);
  }
}
