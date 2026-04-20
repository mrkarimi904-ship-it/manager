function escapeJsonString(value: string): string {
  // Escape for JSON string context (without surrounding quotes)
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function getPath(obj: any, path: string): any {
  if (!obj) return undefined;
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
    else return undefined;
  }
  return cur;
}

export function buildWebhookTemplateContext(eventKey: string, payload: any) {
  return {
    event: {
      key: eventKey,
    },
    timestamp: new Date().toISOString(),
    payload: payload || {},
    meta: {
      // reserved for stable metadata if needed later
    },
  };
}

/**
 * JSON-only renderer.
 * - Replaces {{path.to.value}} placeholders in a JSON string template.
 * - Missing values become empty string.
 * - Returns parsed JSON object, or null if template is invalid JSON after rendering.
 */
export function renderJsonTemplate(template: string, context: any): object | null {
  const t = (template || '').trim();
  if (!t) return {};

  const rendered = t.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, path: string) => {
    const raw = getPath(context, path);
    if (raw === undefined || raw === null) return '';
    if (typeof raw === 'string') return escapeJsonString(raw);
    // For numbers/booleans/objects: stringify, then escape as string content.
    // This keeps behavior predictable because most templates place placeholders inside quotes.
    return escapeJsonString(JSON.stringify(raw));
  });

  try {
    return JSON.parse(rendered);
  } catch (e) {
    return null;
  }
}

