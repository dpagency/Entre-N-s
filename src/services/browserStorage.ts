// Keep the current page usable when the browser denies persistent storage.
const memory = new Map<string, string>();
let available = true;
export const browserStorage = {
  get persistent() { return available; },
  getItem(key: string): string | null {
    try { return globalThis.localStorage.getItem(key) ?? memory.get(key) ?? null; }
    catch { available = false; return memory.get(key) ?? null; }
  },
  setItem(key: string, value: string) {
    memory.set(key, value);
    try { globalThis.localStorage.setItem(key, value); } catch { available = false; }
  },
  removeItem(key: string) {
    memory.delete(key);
    try { globalThis.localStorage.removeItem(key); } catch { available = false; }
  },
};
