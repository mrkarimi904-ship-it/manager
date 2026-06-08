import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AccountRoles, User } from './account/account.decorator';
import { AccountGuard } from './account/account.guard';
import { DbService } from './db/db.service';
import { LprQueueService } from './lpr_queue/lpr_queue.service';
import { StorageService } from './storage/storage.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dbService: DbService,
    private readonly lprQueueService: LprQueueService,
    private readonly storageService: StorageService,
  ) {}

  @Get('health')
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }

  @Get('health/status')
  async getHealthStatus() {
    const database = await this.dbService.checkHealth();
    const redis = await this.lprQueueService.checkRedisHealth();
    const minio = await this.storageService.checkHealth();
    const status = database && redis ? (minio.enabled && !minio.ok ? 'degraded' : 'healthy') : database ? 'degraded' : 'unhealthy';
    return {
      status,
      database,
      redis,
      minio,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/infrastructure')
  @ApiBearerAuth()
  @ApiTags('health')
  @AccountRoles('license')
  @UseGuards(AccountGuard)
  async getInfrastructureHealth() {
    const [database, redis, minio] = await Promise.all([
      this.dbService.checkHealth(),
      this.lprQueueService.checkRedisHealth(),
      this.storageService.checkHealth(),
    ]);
    const components = {
      database: { ok: database, required: true, label: 'PostgreSQL' },
      redis: { ok: redis, required: true, label: 'Redis' },
      minio: { ok: minio.ok, required: minio.enabled, enabled: minio.enabled, bucket: minio.bucket, message: minio.message, label: 'MinIO' },
    };
    const requiredOk = components.database.ok && components.redis.ok && (!components.minio.required || components.minio.ok);
    const status = requiredOk ? 'healthy' : (components.database.ok ? 'degraded' : 'unhealthy');
    return {
      status: true,
      data: {
        status,
        components,
        timestamp: new Date().toISOString(),
      },
      error: null,
      msg: null,
    };
  }

  @Get('self')
  @AccountRoles()
  @UseGuards(AccountGuard)
  getMe(@User() user) {
    return { expired: user.expired, firstname: user.firstname, lastname: user.lastname, mustchangepassword: user.mustchangepassword, username: user.username };
  }
}
