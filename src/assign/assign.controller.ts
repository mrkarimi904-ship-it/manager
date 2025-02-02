import { Controller, Post, Body, UseGuards, Param, Delete } from '@nestjs/common';
import { AssignService } from './assign.service';
import * as dtos from './dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { generalResponse } from 'src/app.consts';
import { AccountRoles, User } from 'src/account/account.decorator';
import { accountGaurd } from 'src/account/account.gaurd';

@ApiBearerAuth()
@ApiTags('05. assign')
@Controller('assign')
export class AssignController {
  constructor(private readonly assignService: AssignService) {}

  @Post('user_to_usergroup')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async user_to_usergroup(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.user_to_usergroup(data, user);
  }

  @Post('user_to_usergroup_all')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async user_to_usergroup_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.user_to_usergroup_all(data, user);
  }

  @Post('user_to_camera')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async user_to_camera(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.user_to_camera(data, user);
  }

  @Post('user_to_camera_all')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async user_to_camera_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.user_to_camera_all(data, user);
  }

  @Post('user_to_cameragroup')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async user_to_cameragroup(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.user_to_cameragroup(data, user);
  }

  @Post('user_to_cameragroup_all')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async user_to_cameragroup_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.user_to_cameragroup_all(data, user);
  }

  @Post('usergroup_to_user')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async usergroup_to_user(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.usergroup_to_user(data, user);
  }

  @Post('usergroup_to_user_all')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async usergroup_to_user_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.usergroup_to_user_all(data, user);
  }

  @Post('usergroup_to_camera')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async usergroup_to_camera(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.usergroup_to_camera(data, user);
  }

  @Post('usergroup_to_camera_all')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async usergroup_to_camera_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.usergroup_to_camera_all(data, user);
  }

  @Post('usergroup_to_cameragroup')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async usergroup_to_cameragroup(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.usergroup_to_cameragroup(data, user);
  }

  @Post('usergroup_to_cameragroup_all')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async usergroup_to_cameragroup_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.usergroup_to_cameragroup_all(data, user);
  }

  @Post('camera_to_user')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async camera_to_user(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.camera_to_user(data, user);
  }

  @Post('camera_to_user_all')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async camera_to_user_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.camera_to_user_all(data, user);
  }

  @Post('camera_to_usergroup')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async camera_to_usergroup(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.camera_to_usergroup(data, user);
  }

  @Post('camera_to_usergroup_all')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async camera_to_usergroup_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.camera_to_usergroup_all(data, user);
  }

  @Post('camera_to_cameragroup')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async camera_to_cameragroup(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.camera_to_cameragroup(data, user);
  }

  @Post('camera_to_cameragroup_all')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async camera_to_cameragroup_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.camera_to_cameragroup_all(data, user);
  }

  @Post('cameragroup_to_user')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async cameragroup_to_user(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.cameragroup_to_user(data, user);
  }

  @Post('cameragroup_to_user_all')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async cameragroup_to_user_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.cameragroup_to_user_all(data, user);
  }

  @Post('cameragroup_to_usergroup')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async cameragroup_to_usergroup(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.cameragroup_to_usergroup(data, user);
  }

  @Post('cameragroup_to_usergroup_all')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async cameragroup_to_usergroup_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.cameragroup_to_usergroup_all(data, user);
  }

  @Post('cameragroup_to_camera')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async cameragroup_to_camera(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.cameragroup_to_camera(data, user);
  }

  @Post('cameragroup_to_camera_all')
  @AccountRoles('assign_entities')
  @UseGuards(accountGaurd)
  async cameragroup_to_camera_all(@User() user, @Body() data: dtos.assignToAllDto): Promise<generalResponse> {
    return await this.assignService.cameragroup_to_camera_all(data, user);
  }

  @Post('role_to_user')
  @AccountRoles('assign_roles')
  @UseGuards(accountGaurd)
  async role_to_user(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.role_to_user(data, user);
  }

  @Post('role_to_usergroup')
  @AccountRoles('assign_roles')
  @UseGuards(accountGaurd)
  async role_to_usergroup(@User() user, @Body() data: dtos.assignDto): Promise<generalResponse> {
    return await this.assignService.role_to_usergroup(data, user);
  }
}
