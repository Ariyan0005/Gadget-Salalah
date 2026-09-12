type CacheEntry<T> = {
  data: T;
  expiry: number;
};

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private readonly maxEntries = 1_000;

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
    this.store.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(keyOrPattern: string | RegExp): void {
    if (typeof keyOrPattern === "string") {
      this.store.delete(keyOrPattern);
    } else {
      for (const key of this.store.keys()) {
        if (keyOrPattern.test(key)) {
          this.store.delete(key);
        }
      }
    }
  }

  clear(): void {
    this.store.clear();
  }
}

export const memoryCache = new MemoryCache();
