import { Module } from '@nestjs/common';
import { AccountGroupController } from './account_group.controller';
import { AccountGroupService } from './account_group.service';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [AccountGroupController],
  providers: [AccountGroupService],
})
export class AccountGroupModule {}
