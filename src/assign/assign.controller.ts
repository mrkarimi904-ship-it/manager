import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AssignService } from './assign.service';
import * as dtos from './dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { generalResponse } from 'src/app.consts';
import { AccountRoles, User } from 'src/account/account.decorator';
import { accountGaurd } from 'src/account/account.gaurd';

@ApiBearerAuth()
@ApiTags('assign')
@Controller('assign')
export class AssignController {
  constructor(private readonly assignService: AssignService) {}

  @Post('camera_to_account')
  @AccountRoles('camera_list')
  @UseGuards(accountGaurd)
  async camera_to_account(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.camera_to_account(data, user);
  }

  @Post('camera_to_account_all')
  @AccountRoles('camera_list')
  @UseGuards(accountGaurd)
  async camera_to_account_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.camera_to_account_all(data, user);
  }

  @Post('camera_all_to_account')
  @AccountRoles('camera_list')
  @UseGuards(accountGaurd)
  async camera_all_to_account(@User() user, @Body() data: dtos.assignFromAllDto): Promise<generalResponse> {
    return await this.assignService.camera_all_to_account(data, user);
  }
}
