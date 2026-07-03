import { Controller, Get, Post, UseGuards, HttpException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRoles } from 'src/account/account.decorator';
import { AccountGuard } from 'src/account/account.guard';
import { generalResponse } from 'src/app.consts';
import { BackupRestoreService } from './backup-restore.service';

@ApiBearerAuth()
@ApiTags('backup-restore')
@Controller('backup-restore')
export class BackupRestoreController {
  constructor(private readonly backupRestoreService: BackupRestoreService) {}

  /**
   * Get current disk space status for all monitored paths.
   */
  @Get('status')
  @AccountRoles('license')
  @UseGuards(AccountGuard)
  async getStatus(): Promise<generalResponse> {
    try {
      const data = this.backupRestoreService.getDiskSpaceStatus();
      const response: generalResponse = { status: true, data, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  /**
   * Manually trigger a disk space check and return current status.
   */
  @Post('check-disk')
  @AccountRoles('license')
  @UseGuards(AccountGuard)
  async triggerDiskCheck(): Promise<generalResponse> {
    try {
      const settings = await this.backupRestoreService.getSettings();
      await this.backupRestoreService.checkDiskSpace(settings);
      const data = this.backupRestoreService.getDiskSpaceStatus();
      const response: generalResponse = { status: true, data, error: null, msg: 'Disk space check completed' };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }
}
