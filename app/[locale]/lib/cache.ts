type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<any>>()

export function setCache<T>(key: string, value: T, ttlSeconds = 60) {
  cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.value as T
}

export function clearCache(key?: string) {
  if (key) cache.delete(key)
  else cache.clear()
}
