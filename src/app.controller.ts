import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AccountRoles, User } from './account/account.decorator';
import { AccountGuard } from './account/account.guard';
import { DbService } from './db/db.service';
import { LprQueueService } from './lpr_queue/lpr_queue.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dbService: DbService,
    private readonly lprQueueService: LprQueueService
  ) {}

  @Get('health')
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }

  @Get('health/status')
  async getHealthStatus() {
    const database = await this.dbService.checkHealth();
    const redis = await this.lprQueueService.checkRedisHealth();
    const status = database && redis ? 'healthy' : database ? 'degraded' : 'unhealthy';
    return {
      status,
      database,
      redis,
      timestamp: new Date().toISOString()
    };
  }

  @Get('self')
  @AccountRoles()
  @UseGuards(AccountGuard)
  getMe(@User() user) {
    return { expired: user.expired, firstname: user.firstname, lastname: user.lastname, mustchangepassword: user.mustchangepassword, username: user.username };
  }
}
