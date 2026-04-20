import { HttpException, Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { generalResponse } from "src/app.consts";
import * as dtos from "./webhook.dtos";
import { isValidWebhookEventKey } from "./webhook.events";

@Injectable()
export class WebhookService {
  constructor(private readonly db: DbService) {}

  async list(): Promise<generalResponse> {
    try {
      const data = await this.db.webhook_endpoint.findMany({ orderBy: [{ created_at: "desc" }] });
      return { status: true, data, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error, msg: error.message }, 406);
    }
  }

  async get(id: string): Promise<generalResponse> {
    try {
      const data = await this.db.webhook_endpoint.findUnique({ where: { id } });
      return { status: true, data, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error, msg: error.message }, 406);
    }
  }

  private validateEventKeys(event_keys: string) {
    let parsed: any = null;
    try {
      parsed = JSON.parse(event_keys);
    } catch (e) {
      throw new HttpException({ status: false, data: null, error: "invalid event_keys", msg: "event_keys must be JSON array" }, 406);
    }
    if (!Array.isArray(parsed)) {
      throw new HttpException({ status: false, data: null, error: "invalid event_keys", msg: "event_keys must be JSON array" }, 406);
    }
    for (const k of parsed) {
      if (typeof k !== "string" || !isValidWebhookEventKey(k)) {
        throw new HttpException({ status: false, data: null, error: "invalid event_keys", msg: `unsupported event key: ${k}` }, 406);
      }
    }
  }

  private validateMethod(method: string) {
    const m = (method || "").toUpperCase();
    if (!["GET", "POST", "PUT"].includes(m)) {
      throw new HttpException({ status: false, data: null, error: "invalid method", msg: "method must be GET|POST|PUT" }, 406);
    }
  }

  private validateJsonTemplate(body_template: string) {
    try {
      JSON.parse(body_template);
    } catch (e) {
      // Allow placeholders: validate by replacing placeholders with empty string, then parse.
      const replaced = (body_template || "").replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, "");
      try {
        JSON.parse(replaced);
      } catch (e2) {
        throw new HttpException({ status: false, data: null, error: "invalid body_template", msg: "body_template must be valid JSON (placeholders allowed)" }, 406);
      }
    }
  }

  async create(body: dtos.webhookEndpointCreateDto): Promise<generalResponse> {
    try {
      this.validateEventKeys(body.event_keys);
      this.validateMethod(body.method);
      this.validateJsonTemplate(body.body_template);

      const data = await this.db.webhook_endpoint.create({
        data: {
          name: body.name,
          enabled: body.enabled ?? true,
          event_keys: body.event_keys,
          method: body.method.toUpperCase(),
          url: body.url,
          bearer_token: body.bearer_token ?? "",
          body_template: body.body_template,
          timeout_ms: body.timeout_ms ?? 5000,
        },
      });
      return { status: true, data, error: null, msg: null };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException({ status: false, data: null, error, msg: error.message }, 406);
    }
  }

  async update(id: string, body: dtos.webhookEndpointUpdateDto): Promise<generalResponse> {
    try {
      if (body.event_keys !== undefined) this.validateEventKeys(body.event_keys);
      if (body.method !== undefined) this.validateMethod(body.method);
      if (body.body_template !== undefined) this.validateJsonTemplate(body.body_template);

      const data = await this.db.webhook_endpoint.update({
        where: { id },
        data: {
          name: body.name,
          enabled: body.enabled,
          event_keys: body.event_keys,
          method: body.method ? body.method.toUpperCase() : undefined,
          url: body.url,
          bearer_token: body.bearer_token,
          body_template: body.body_template,
          timeout_ms: body.timeout_ms,
        },
      });
      return { status: true, data, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error, msg: error.message }, 406);
    }
  }

  async remove(id: string): Promise<generalResponse> {
    try {
      const data = await this.db.webhook_endpoint.delete({ where: { id } });
      return { status: true, data, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error, msg: error.message }, 406);
    }
  }
}

