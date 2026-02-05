import { Module } from '@nestjs/common';
import { OnvifController } from './onvif.controller';
import { OnvifService } from './onvif.service';
import { DbModule } from 'src/db/db.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DbModule, HttpModule],
  controllers: [OnvifController],
  providers: [OnvifService],
})
export class OnvifModule {}
