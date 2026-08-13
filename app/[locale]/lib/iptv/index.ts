import { getCatalog, syncCatalog, getSyncStatus, isSyncRunning } from '../../lib/iptv/catalog'

export interface Stream {
  url: string
  quality?: string
  format?: string
  source?: string
  verified?: boolean | null
}

export interface Channel {
  id: string
  name: string
  country?: string
  countryCode?: string
  languages?: string[]
  categories?: string[]
  logo?: string
  website?: string
  epgId?: string
  isLive?: boolean
  quality?: string
  source?: string
  sources?: string[]
  streams?: Stream[]
}

export { syncCatalog, getSyncStatus, isSyncRunning }

const IPTV_CHANNELS_URL = 'https://dearbulut.github.io/iptv/api/v1/channels.online.json'
const IPTV_STREAMS_URL = 'https://dearbulut.github.io/iptv/playlists/best.m3u'
const IPTV_M3U_URL = 'https://dearbulut.github.io/iptv/playlists/best.m3u'

let cachedChannelsPromise: Promise<Channel[]> | null = null

function sanitizeId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '')
}

function normalizeId(value: string) {
  const baseId = value.split('@')[0]
  return sanitizeId(baseId)
}

function buildIdentifierVariants(value: string) {
  const raw = String(value ?? '').trim()
  if (!raw) return []

  let decoded = raw
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    decoded = raw
  }

  const variants = new Set<string>()
  const add = (candidate?: string) => {
    if (!candidate) return
    const trimmed = candidate.trim()
    if (!trimmed) return
    variants.add(trimmed.toLowerCase())
    variants.add(normalizeId(trimmed))
    variants.add(sanitizeId(trimmed))
    variants.add(trimmed.replace(/[^a-z0-9]+/gi, '.').replace(/^\.+|\.+$/g, ''))
    variants.add(trimmed.replace(/[^a-z0-9]+/gi, ''))
  }

  add(raw)
  add(decoded)
  return Array.from(variants)
}

export function findChannel(channels: Channel[], query: string) {
  const rawQuery = String(query ?? '').trim()
  if (!rawQuery) return undefined

  const queryVariants = new Set(buildIdentifierVariants(rawQuery))
  return channels.find((channel) => {
    const candidates = [channel.id, channel.name, ...(channel.categories || []), ...(channel.languages || [])]
    return candidates.some((candidate) => {
      if (!candidate) return false
      const variants = buildIdentifierVariants(candidate)
      return variants.some((variant) => queryVariants.has(variant))
    })
  })
}

function parseExtInf(line: string) {
  const attrs: Record<string, string> = {}
  const regex = /([^=\s]+?)="([^"]*)"/g
  let match
  while ((match = regex.exec(line)) !== null) {
    attrs[match[1]] = match[2]
  }

  const titleMatch = line.match(/,(.*)$/)
  const title = titleMatch?.[1]?.trim() || ''

  return {
    title,
    tvgId: attrs['tvg-id'] || attrs['tvg-name'] || undefined,
    tvgName: attrs['tvg-name'] || undefined,
    tvgLogo: attrs['tvg-logo'] || undefined,
    groupTitle: attrs['group-title'] || undefined,
    tvgLanguage: attrs['tvg-language'] || undefined,
    country: attrs['country'] || undefined,
    customAttributes: attrs
  }
}

function parseM3U(raw: string) {
  const lines = raw.split(/\r?\n/)
  const items: Array<{ id: string; name: string; logo?: string; group?: string; language?: string; country?: string; url: string }> = []
  let current: ReturnType<typeof parseExtInf> | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('#EXTINF:')) {
      current = parseExtInf(trimmed)
      continue
    }

    if (trimmed.startsWith('#')) continue
    if (!current) continue

    const name = current.tvgName || current.title || trimmed
    const id = current.tvgId ? normalizeId(current.tvgId) : sanitizeId(name)
    items.push({
      id,
      name,
      logo: current.tvgLogo,
      group: current.groupTitle,
      language: current.tvgLanguage,
      country: current.country,
      url: trimmed
    })
    current = null
  }

  return items
}

export async function fetchChannels(): Promise<Channel[]> {
  const catalog = getCatalog()
  return catalog as Channel[]
}
