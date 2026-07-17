const store = new Map<string, { value: unknown; expiresAt: number }>();

/** Simple in-memory TTL cache for read-heavy Supabase queries within an SPA session.
 *  Avoids re-fetching the same data every time the user navigates back to a view. */
export async function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;

  const value = await fetcher();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

/** Drop cached entries so the next read is forced to hit the network again.
 *  Call after a mutation (enroll, publish, etc.) that the cached data depends on. */
export function invalidateCache(prefix?: string) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
