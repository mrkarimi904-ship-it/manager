export function extractErrorMessage(error: unknown): string {
  if (error == null) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    const err = error as Record<string, unknown>;
    if (typeof err.message === 'string' && err.message) return err.message;
    if (err.response && typeof err.response === 'object') {
      const data = (err.response as Record<string, unknown>).data as Record<string, unknown> | undefined;
      if (data) {
        if (typeof data.msg === 'string' && data.msg) return data.msg;
        if (typeof data.message === 'string' && data.message) return data.message;
        if (typeof data.error === 'string' && data.error) return data.error;
      }
    }
    if (typeof err.msg === 'string' && err.msg) return err.msg;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

export function toErrorResponse(error: unknown, fallback = 'Operation failed') {
  const msg = extractErrorMessage(error) || fallback;
  return { status: false, data: null, error: msg, msg };
}
