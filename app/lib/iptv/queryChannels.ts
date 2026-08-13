import { Channel } from './index'

export interface ChannelQuery {
  q?: string
  country?: string
  category?: string
  quality?: string
  language?: string
  source?: string
  live?: string
  page?: number
  pageSize?: number
}

// Shared channel filtering used by both the root and localized /api/iptv/channels
// routes. Supports the Free Stream filter dimensions: search, country, category,
// quality, language, source and live flag.
export function filterChannelsQuery(channels: Channel[], q: ChannelQuery): Channel[] {
  let filtered = channels
  const search = (q.q || '').toLowerCase().trim()
  if (search) {
    filtered = filtered.filter((c) => {
      const hay = [
        c.id,
        c.name,
        c.country,
        c.countryCode,
        (c.categories || []).join(' '),
        (c.languages || []).join(' '),
        (c.streams || []).map((s) => s.url).join(' '),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(search)
    })
  }
  if (q.country) {
    filtered = filtered.filter(
      (c) =>
        (c.countryCode || '').toLowerCase() === q.country!.toLowerCase() ||
        (c.country || '').toLowerCase().includes(q.country!.toLowerCase()),
    )
  }
  if (q.category) {
    filtered = filtered.filter((c) =>
      (c.categories || []).map((s) => s.toLowerCase()).includes(q.category!.toLowerCase()),
    )
  }
  if (q.quality) {
    const qs = q.quality
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    filtered = filtered.filter((c) => c.quality && qs.includes(c.quality.toLowerCase()))
  }
  if (q.language) {
    const ls = q.language
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    filtered = filtered.filter((c) => (c.languages || []).some((l) => ls.includes(l.toLowerCase())))
  }
  if (q.source) {
    const ss = q.source
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    filtered = filtered.filter(
      (c) =>
        (c.sources || []).some((s) => ss.includes(s.toLowerCase())) ||
        ss.includes((c.source || '').toLowerCase()),
    )
  }
  if (q.live === 'true') {
    filtered = filtered.filter((c) => c.isLive !== false)
  }
  return filtered
}
