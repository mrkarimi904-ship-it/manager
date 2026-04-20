export type WebhookEventKey =
  | 'lpr.blacklist_detected'
  | 'lpr.whitelist_detected'
  | 'lpr.notifiable_detected';

export const WEBHOOK_EVENT_KEYS: WebhookEventKey[] = [
  'lpr.blacklist_detected',
  'lpr.whitelist_detected',
  'lpr.notifiable_detected',
];

export function webhookBusEventName(eventKey: string): string {
  return `background.webhook.${eventKey}`;
}

export function isValidWebhookEventKey(eventKey: string): eventKey is WebhookEventKey {
  return WEBHOOK_EVENT_KEYS.includes(eventKey as WebhookEventKey);
}

export function webhookEventDisplayName(eventKey: string): string {
  switch (eventKey) {
    case 'lpr.blacklist_detected':
      return 'LPR blacklist detected';
    case 'lpr.whitelist_detected':
      return 'LPR whitelist detected';
    case 'lpr.notifiable_detected':
      return 'LPR notifiable detected';
    default:
      return eventKey;
  }
}

