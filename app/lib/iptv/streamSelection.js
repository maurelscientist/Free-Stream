function getStreamPriority(url) {
  const normalized = String(url || '').toLowerCase()
  if (normalized.includes('.m3u8') || normalized.includes('.m3u')) return 0
  if (/\.(mp4|mpd|webm|mov)(\?|$)/i.test(normalized)) return 1
  return 2
}

const invalidUrlPatterns = ['%7B', '%7D', '{', '}', 'TARGETOPT', 'PSID', 'APP_DOMAIN', 'APP_NAME']
const invalidHosts = ['jmp2.uk', 'stitcher-ipv4.pluto.tv', 'pluto.tv']

export function isValidUrl(value) {
  const url = String(value || '').trim()
  if (!url) return false

  const lower = url.toLowerCase()
  if (invalidUrlPatterns.some((pat) => lower.includes(pat.toLowerCase()))) return false

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    if (invalidHosts.includes(parsed.hostname.toLowerCase())) return false
    return true
  } catch {
    return false
  }
}

export function buildStreamCandidates(streams = []) {
  return (Array.isArray(streams) ? streams : [])
    .filter((stream) => Boolean(stream?.url) && isValidUrl(stream.url))
    .map((stream) => ({ url: String(stream.url), priority: getStreamPriority(stream.url) }))
    .sort((a, b) => a.priority - b.priority)
    .map((item) => item.url)
}
