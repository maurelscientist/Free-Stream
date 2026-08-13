import { AggregatedChannel, NormalizedStream, RawChannel } from './types'
import { resolveCountryCode, countryCodeToName } from './countryDetect'

// ---------------------------------------------------------------------------
// Level 1 helpers: identifiers
// ---------------------------------------------------------------------------

export function normalizeId(value?: string): string {
  if (!value) return ''
  const base = String(value).split('@')[0]
  return base
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

export function normalizeUrl(url?: string): string {
  if (!url) return ''
  return String(url).trim().toLowerCase().replace(/\s+/g, '')
}

// ---------------------------------------------------------------------------
// Level 2 helpers: name normalization
// ---------------------------------------------------------------------------

const LANGUAGE_HINTS: [RegExp, string][] = [
  [/\b(french|français|france)\b/i, 'fr'],
  [/\b(english|anglais|uk|usa?)\b/i, 'en'],
  [/\b(spanish|español|espagnol)\b/i, 'es'],
  [/\b(arabic|arabe|arab)\b/i, 'ar'],
  [/\b(german|allemand|deutsch)\b/i, 'de'],
  [/\b(italian|italiano|italien)\b/i, 'it'],
  [/\b(portuguese|português|portugais)\b/i, 'pt'],
  [/\b(russian|russe)\b/i, 'ru'],
  [/\b(chinese|chinois)\b/i, 'zh'],
  [/\b(turkish|turc)\b/i, 'tr'],
  [/\b(japanese|japonais)\b/i, 'ja'],
  [/\b(korean|coréen)\b/i, 'ko'],
]

export function detectLanguageFromName(name: string): string | null {
  for (const [re, code] of LANGUAGE_HINTS) {
    if (re.test(name)) return code
  }
  return null
}

const QUALITY_TOKENS = /\b(4k|uhd|2160p|fhd|1080p|1080i|hd|720p|576p|480p|360p|240p|sd|ld|hdr|hevc|h264|h265)\b/gi

export function normalizeName(name: string): string {
  let n = String(name || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
  // Normalize "France 24" / "France24" / "FRANCE 24 HD" families.
  n = n.replace(/france\s*24/g, 'france24')
  // Drop quality / codec tokens that do not make a different channel.
  n = n.replace(QUALITY_TOKENS, ' ')
  // Keep only alphanumerics and spaces.
  n = n.replace(/[^a-z0-9\s]/g, ' ')
  n = n.replace(/\s+/g, ' ').trim()
  return n
}

export function compactName(name: string): string {
  return normalizeName(name).replace(/\s+/g, '')
}

// ---------------------------------------------------------------------------
// Quality / format detection
// ---------------------------------------------------------------------------

const QUALITY_ORDER = [
  '2160p', '4k', 'uhd', '1080p', '1080i', 'fhd', '720p', 'hd',
  '576p', '480p', '360p', '240p', 'sd', 'ld',
]

export function parseQuality(url: string, attrs?: Record<string, string>): string | undefined {
  const hay = (
    url +
    ' ' +
    (attrs?.['group-title'] || '') +
    ' ' +
    (attrs?.['tvg-name'] || '')
  ).toLowerCase()
  for (const q of QUALITY_ORDER) {
    if (hay.includes(q)) return q
  }
  return undefined
}

export function parseFormat(url: string): string {
  const u = url.toLowerCase()
  if (u.includes('.m3u8')) return 'hls'
  if (u.includes('.mpd')) return 'dash'
  if (u.includes('.mp4')) return 'mp4'
  if (u.includes('.webm')) return 'webm'
  if (u.includes('.ts')) return 'ts'
  return 'other'
}

// ---------------------------------------------------------------------------
// Fingerprint / duplicate detection
// ---------------------------------------------------------------------------

interface DupCandidate {
  id?: string
  epgId?: string
  name: string
  country?: string
  countryCode?: string
  languages?: string[]
  language?: string
  url?: string
  streams?: { url: string }[]
}

function languageOf(c: DupCandidate): string {
  if (c.languages && c.languages.length) return c.languages[0].toLowerCase()
  if (c.language) return c.language.toLowerCase()
  const detected = detectLanguageFromName(c.name)
  return detected || ''
}

function countryOf(c: DupCandidate): string {
  const raw = c.countryCode || c.country || ''
  return raw.toLowerCase().replace(/[^a-z]/g, '')
}

/**
 * Multi-level duplicate detection.
 *  - Level 1: identical tvg-id / stable id.
 *  - Level 3: identical stream URL.
 *  - Level 2: normalized name + matching country + matching language.
 * Language is the key differentiator so "France 24 French" != "France 24 English".
 */
export function isDuplicate(a: AggregatedChannel, b: DupCandidate): boolean {
  // Level 1 — identifier
  const aId = normalizeId(a.id || a.epgId)
  const bId = normalizeId(b.id || b.epgId)
  if (aId && bId && aId === bId) return true

  // Level 3 — URL
  const aUrls = new Set((a.streams || []).map((s) => normalizeUrl(s.url)))
  const bUrl = normalizeUrl(b.url || b.streams?.[0]?.url)
  if (bUrl && aUrls.has(bUrl)) return true

  // Level 2 — name + country + language
  const aLang = languageOf(a)
  const bLang = languageOf(b)
  const aCountry = countryOf(a)
  const bCountry = countryOf(b)
  const countryMatch = !aCountry || !bCountry || aCountry === bCountry
  const langMatch = !aLang || !bLang || aLang === bLang

  if (countryMatch && langMatch) {
    if (normalizeName(a.name) === normalizeName(b.name)) return true
    if (compactName(a.name) === compactName(b.name)) return true
  }

  return false
}

// ---------------------------------------------------------------------------
// Merge / best-stream selection
// ---------------------------------------------------------------------------

function isBetterLogo(candidate?: string, current?: string): boolean {
  if (!candidate) return false
  if (!current) return true
  const cHttps = candidate.startsWith('https')
  const curHttps = current.startsWith('https')
  if (cHttps !== curHttps) return cHttps
  return candidate.length >= current.length
}

export function mergeChannelData(
  existing: AggregatedChannel,
  incoming: RawChannel,
): AggregatedChannel {
  const merged: AggregatedChannel = { ...existing }

  // Streams (dedupe by normalized URL, keep both sources' streams).
  const streamMap = new Map<string, NormalizedStream>()
  for (const s of existing.streams) streamMap.set(normalizeUrl(s.url), s)
  const newStream: NormalizedStream = {
    url: incoming.url,
    quality: parseQuality(incoming.url, incoming.attributes),
    format: parseFormat(incoming.url),
    source: incoming.source,
    verified: null,
  }
  streamMap.set(normalizeUrl(incoming.url), newStream)
  merged.streams = Array.from(streamMap.values())

  // Languages (union, prefer explicit then detected).
  const langs = new Set<string>(existing.languages || [])
  if (incoming.language) langs.add(incoming.language)
  const detected = detectLanguageFromName(incoming.name)
  if (detected) langs.add(detected)
  if (langs.size) merged.languages = Array.from(langs)

  // Categories (union of group-title values).
  const cats = new Set<string>(existing.categories || [])
  if (incoming.group) cats.add(incoming.group)
  if (cats.size) merged.categories = Array.from(cats)

  // Country: fill from the incoming entry, falling back to inference (and
  // ultimately FALLBACK_COUNTRY) when neither side carries an explicit country.
  if (!merged.countryCode) {
    const detected = resolveCountryCode({
      country: incoming.country,
      countryCode: incoming.countryCode,
      epgId: incoming.epgId,
      id: incoming.id,
      url: incoming.url,
      group: incoming.group,
      language: incoming.language,
      name: incoming.name,
    })
    merged.countryCode = detected
    merged.country = countryCodeToName(detected)
  }
  if (!merged.country && incoming.country) merged.country = incoming.country

  // Logo (keep the better one: https > http, longer/cleaner).
  if (isBetterLogo(incoming.logo, merged.logo)) merged.logo = incoming.logo

  // EPG id.
  if (!merged.epgId && (incoming.epgId || incoming.id)) {
    merged.epgId = incoming.epgId || incoming.id
  }

  // Source list.
  merged.sources = Array.from(new Set([...(existing.sources || []), incoming.source]))

  // Prefer an id that carries a tvg-id.
  if (!normalizeId(existing.id) && normalizeId(incoming.id)) {
    merged.id = normalizeId(incoming.id)
  }

  return merged
}

const QUALITY_RANK: Record<string, number> = {
  '4k': 9, uhd: 9, '2160p': 9,
  fhd: 8, '1080p': 8, '1080i': 7,
  hd: 6, '720p': 5,
  '576p': 4, '480p': 3, '360p': 2, '240p': 1, sd: 1, ld: 0,
}

/**
 * Select the best stream for a channel using the priority rules:
 * 1) working (verified) 2) quality 3) https 4) stable URL 5) source reliability.
 */
export function selectBestStream(
  streams: NormalizedStream[],
  sourcePriority: Record<string, number> = {},
): NormalizedStream | null {
  if (!streams || !streams.length) return null
  const scored = streams.map((s) => {
    let score = 0
    if (s.verified === true) score += 1000
    else if (s.verified === false) score -= 500
    const q = (s.quality || '').toLowerCase()
    score += QUALITY_RANK[q] ?? 2
    if (s.url.startsWith('https')) score += 5
    if (!s.url.includes('?')) score += 2
    score += (sourcePriority[s.source || ''] || 0) / 100
    return { s, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0].s
}
