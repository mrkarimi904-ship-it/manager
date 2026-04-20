import { Module } from "@nestjs/common";
import { DbModule } from "src/db/db.module";
import { HttpModule } from "@nestjs/axios";
import { LoggerModule } from "src/logger/logger.module";
import { WebhookController } from "./webhook.controller";
import { WebhookService } from "./webhook.service";
import { WebhookDispatcherService } from "./webhook.dispatcher";

@Module({
  imports: [DbModule, HttpModule, LoggerModule],
  controllers: [WebhookController],
  providers: [WebhookService, WebhookDispatcherService],
  exports: [WebhookService, WebhookDispatcherService],
})
export class WebhookModule {}

