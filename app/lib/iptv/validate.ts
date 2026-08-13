// Stream validation utilities.
// Lightweight HTTP checks with timeouts so a single dead host can never block
// the whole aggregation. Validation is best-effort and fault tolerant.

export function isValidUrl(value?: string): boolean {
  if (!value) return false
  try {
    const u = new URL(value)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    return true
  } catch {
    return false
  }
}

export interface ValidationResult {
  ok: boolean
  status?: number
  latencyMs?: number
}

export async function validateStream(url: string, timeoutMs = 6000): Promise<ValidationResult> {
  const start = Date.now()

  const tryFetch = async (method: 'HEAD' | 'GET'): Promise<ValidationResult> => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 FreeStream/1.0' },
      })
      return { ok: res.ok, status: res.status, latencyMs: Date.now() - start }
    } finally {
      clearTimeout(timer)
    }
  }

  try {
    const head = await tryFetch('HEAD')
    if (head.status !== 405 && head.status !== 403) return head
  } catch {
    // fall through to GET
  }
  try {
    return await tryFetch('GET')
  } catch {
    return { ok: false, latencyMs: Date.now() - start }
  }
}

export interface ValidateOptions {
  concurrency?: number
  max?: number
  timeoutMs?: number
}

export async function validateStreams(
  streams: { url: string }[],
  opts: ValidateOptions = {},
): Promise<{ url: string; ok: boolean; status?: number }[]> {
  const concurrency = Math.max(1, opts.concurrency ?? 12)
  const max = opts.max ?? streams.length
  const list = streams.slice(0, max)
  const results: { url: string; ok: boolean; status?: number }[] = []
  let idx = 0

  async function worker() {
    while (idx < list.length) {
      const item = list[idx++]
      const r = await validateStream(item.url, opts.timeoutMs ?? 6000)
      results.push({ url: item.url, ok: r.ok, status: r.status })
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, list.length) }, () => worker())
  await Promise.all(workers)
  return results
}
