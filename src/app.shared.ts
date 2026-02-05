// Shared utility functions for permission checks and common operations

/** Run async tasks with a concurrency limit; returns results in same order as items. */
export async function runWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  async function worker(): Promise<void> {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export function buildUserPermissionWhere(user: any, where: any): void {
  if (user.isSuperAdmin === true) { return }
  where['AND'].push({ OR: [
    { user_accounts: { some: { id: { equals: user.id } } } },
    { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
    { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
    { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
  ] })
}
