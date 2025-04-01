interface CacheEntry<T> {
  expiry: number;
  value: T;
}

export class EphemeralCache {
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  private readonly defaultTtlMs: number;

  public constructor(defaultTtlMs: number) {
    this.defaultTtlMs = defaultTtlMs;
  }

  public clear(): void {
    this.cache.clear();
  }

  public delete(...keys: string[]): boolean {
    return keys.every((key) => this.cache.delete(key));
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiry < Date.now()) {
      this.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public set<T>(
    key: string,
    value: T,
    ttlMs: number = this.defaultTtlMs
  ): void {
    this.cache.set(key, {
      expiry: Date.now() + ttlMs,
      value
    });
  }

  public wrap<T, TArgs extends unknown[]>(
    fn: (...args: TArgs) => T,
    { key, ttlMs }: { key: string; ttlMs?: number }
  ): (...args: TArgs) => T {
    return (...args: TArgs) => {
      const cachedValue = this.get<T>(key);

      if (cachedValue) {
        return cachedValue;
      }

      const result = fn(...args);

      this.set(key, result, ttlMs);

      return result;
    };
  }
}
