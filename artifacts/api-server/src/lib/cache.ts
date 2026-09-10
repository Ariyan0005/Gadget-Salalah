type CacheEntry<T> = {
  data: T;
  expiry: number;
};

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

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
