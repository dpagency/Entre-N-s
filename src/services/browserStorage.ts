// Pending mutations are authoritative only for this page, never a durable backup.
export function createBrowserStorage(storage = () => globalThis.localStorage) {
  const memory = new Map<string, string | null>();
  const pending = new Map<string, string | null>();
  const listeners = new Set<() => void>();
  let available = true;
  const flush = () => {
    for (const [key, value] of pending) {
      try {
        const target = storage();
        if (value === null) target.removeItem(key); else target.setItem(key, value);
        if (target.getItem(key) !== value) continue;
        pending.delete(key);
      } catch { /* Retry the latest session value on the next write. */ }
    }
    const next = pending.size === 0;
    if (next !== available) {
      available = next;
      queueMicrotask(() => listeners.forEach(listener => listener()));
    }
  };
  return {
    get persistent() { return available; },
    isPersisted(key: string) { return !pending.has(key); },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    getItem(key: string): string | null {
      if (pending.has(key)) return pending.get(key)!;
      try {
        const value = storage().getItem(key);
        memory.set(key, value);
        return value;
      } catch { return memory.get(key) ?? null; }
    },
    setItem(key: string, value: string) {
      memory.set(key, value);
      pending.set(key, value);
      flush();
    },
    removeItem(key: string) {
      memory.set(key, null);
      pending.set(key, null);
      flush();
    },
  };
}

export const browserStorage = createBrowserStorage();
