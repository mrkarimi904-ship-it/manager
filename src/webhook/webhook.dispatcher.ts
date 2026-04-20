import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { DbService } from "src/db/db.service";
import { LoggerService } from "src/logger/logger.service";
import { OnEvent } from "@nestjs/event-emitter";
import { buildWebhookTemplateContext, renderJsonTemplate } from "./webhook.templates";
import { webhookEventDisplayName, webhookBusEventName, WebhookEventKey } from "./webhook.events";

type WebhookEventMessage = {
  eventKey: WebhookEventKey;
  payload: any;
};

@Injectable()
export class WebhookDispatcherService {
  constructor(
    private readonly db: DbService,
    private readonly axios: HttpService,
    private readonly loggerService: LoggerService,
  ) {}

  private async dispatch(eventKey: WebhookEventKey, payload: any) {
    // best-effort: never throw out of dispatcher
    try {
      const all = await this.db.webhook_endpoint.findMany({ where: { enabled: true } });
      const targets = all.filter((w) => {
        try {
          const keys = JSON.parse(w.event_keys || "[]");
          return Array.isArray(keys) && keys.includes(eventKey);
        } catch (e) {
          return false;
        }
      });

      if (targets.length === 0) return;

      const ctx = buildWebhookTemplateContext(eventKey, payload);
      await Promise.all(
        targets.map(async (w) => {
          try {
            const bodyObj = renderJsonTemplate(w.body_template, ctx);
            if (bodyObj === null) {
              console.log("webhook template invalid json", w.id, w.name);
              return;
            }

            const headers: any = { "Content-Type": "application/json" };
            if (w.bearer_token && w.bearer_token.trim().length > 0) {
              headers["Authorization"] = `Bearer ${w.bearer_token.trim()}`;
            }

            // do not block core flows: request itself is awaited here, but caller schedules dispatch via setImmediate
            await this.axios.axiosRef.request({
              method: (w.method || "POST").toLowerCase(),
              url: w.url,
              data: (w.method || "POST").toUpperCase() === "GET" ? undefined : bodyObj,
              timeout: w.timeout_ms || 5000,
              headers,
              validateStatus: () => true,
            });
          } catch (err: any) {
            console.log("webhook dispatch error", w.id, w.name, err?.message || err);
          }
        }),
      );
    } catch (err: any) {
      console.log("webhook dispatch fatal error", err?.message || err);
    }
  }

  // Explicit listeners to avoid wildcard dependency
  @OnEvent(webhookBusEventName("lpr.blacklist_detected"))
  handleLprBlacklistDetected(msg: WebhookEventMessage) {
    setImmediate(() => void this.dispatch("lpr.blacklist_detected", msg?.payload));
  }

  @OnEvent(webhookBusEventName("lpr.whitelist_detected"))
  handleLprWhitelistDetected(msg: WebhookEventMessage) {
    setImmediate(() => void this.dispatch("lpr.whitelist_detected", msg?.payload));
  }

  @OnEvent(webhookBusEventName("lpr.notifiable_detected"))
  handleLprNotifiableDetected(msg: WebhookEventMessage) {
    setImmediate(() => void this.dispatch("lpr.notifiable_detected", msg?.payload));
  }

  async testFire(endpointId: string, eventKey: WebhookEventKey, payload: any) {
    try {
      const w = await this.db.webhook_endpoint.findUnique({ where: { id: endpointId } });
      if (!w) return { status: false, data: null, error: "not_found", msg: "endpoint not found" };

      const ctx = buildWebhookTemplateContext(eventKey, payload);
      const bodyObj = renderJsonTemplate(w.body_template, ctx);
      if (bodyObj === null) return { status: false, data: null, error: "invalid_template", msg: "template is not valid json after rendering" };

      const headers: any = { "Content-Type": "application/json" };
      if (w.bearer_token && w.bearer_token.trim().length > 0) headers["Authorization"] = `Bearer ${w.bearer_token.trim()}`;

      const res = await this.axios.axiosRef.request({
        method: (w.method || "POST").toLowerCase(),
        url: w.url,
        data: (w.method || "POST").toUpperCase() === "GET" ? undefined : bodyObj,
        timeout: w.timeout_ms || 5000,
        headers,
        validateStatus: () => true,
      });

      return {
        status: true,
        data: {
          endpoint: { id: w.id, name: w.name },
          event: { key: eventKey, name: webhookEventDisplayName(eventKey) },
          request: { method: w.method, url: w.url, body: bodyObj },
          response: { status: res.status, data: res.data },
        },
        error: null,
        msg: null,
      };
    } catch (err: any) {
      await this.loggerService.log(`webhook test failed: ${err?.message || err}`, 0);
      return { status: false, data: null, error: err?.message || err, msg: "webhook test failed" };
    }
  }
}

