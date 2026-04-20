import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AccountGuard } from "src/account/account.guard";
import { AccountRoles, User } from "src/account/account.decorator";
import { generalResponse } from "src/app.consts";
import * as dtos from "./webhook.dtos";
import { WebhookService } from "./webhook.service";
import { WEBHOOK_EVENT_KEYS, webhookEventDisplayName, isValidWebhookEventKey, WebhookEventKey } from "./webhook.events";
import { WebhookDispatcherService } from "./webhook.dispatcher";

@ApiBearerAuth()
@ApiTags("15. settings")
@Controller("settings/webhooks")
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly dispatcher: WebhookDispatcherService,
  ) {}

  @Get("events")
  async events(): Promise<generalResponse> {
    const data = WEBHOOK_EVENT_KEYS.map((key) => ({
      key,
      name: webhookEventDisplayName(key),
      example_payload:
        key === "lpr.blacklist_detected"
          ? { ocr: "11الف111", cameraId: "uuid", resultId: "uuid", isBlackList: true }
          : key === "lpr.whitelist_detected"
            ? { ocr: "11الف111", cameraId: "uuid", resultId: "uuid", isWhiteList: true }
            : { ocr: "11الف111", cameraId: "uuid", resultId: "uuid", isNotifable: true },
    }));
    return { status: true, data, error: null, msg: null };
  }

  @Get()
  async list(): Promise<generalResponse> {
    return await this.webhookService.list();
  }

  @Get(":id")
  async get(@Param("id") id: string): Promise<generalResponse> {
    return await this.webhookService.get(id);
  }

  @Post()
  @AccountRoles("settings_webhook")
  @UseGuards(AccountGuard)
  async create(@User() user: any, @Body() body: dtos.webhookEndpointCreateDto): Promise<generalResponse> {
    return await this.webhookService.create(body);
  }

  @Put(":id")
  @AccountRoles("settings_webhook")
  @UseGuards(AccountGuard)
  async update(@User() user: any, @Param("id") id: string, @Body() body: dtos.webhookEndpointUpdateDto): Promise<generalResponse> {
    return await this.webhookService.update(id, body);
  }

  @Delete(":id")
  @AccountRoles("settings_webhook")
  @UseGuards(AccountGuard)
  async remove(@User() user: any, @Param("id") id: string): Promise<generalResponse> {
    return await this.webhookService.remove(id);
  }

  @Post(":id/test")
  @AccountRoles("settings_webhook")
  @UseGuards(AccountGuard)
  async test(@User() user: any, @Param("id") id: string, @Body() body: dtos.webhookEndpointTestDto): Promise<any> {
    const eventKey = (body.event_key || "lpr.blacklist_detected").toString();
    if (!isValidWebhookEventKey(eventKey)) return { status: false, data: null, error: "invalid_event", msg: "invalid event_key" };
    return await this.dispatcher.testFire(id, eventKey as WebhookEventKey, body.payload || {});
  }
}

