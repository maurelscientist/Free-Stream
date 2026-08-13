import { SOURCES, getSourcePriorityMap } from './sources'
import { parseM3U, isPlaylistUrl } from './m3uParser'
import { RawChannel, AggregatedChannel, SourceConfig, SyncStats } from './types'
import {
  mergeChannelData,
  isDuplicate,
  selectBestStream,
  normalizeId,
  normalizeUrl,
  detectLanguageFromName,
  parseQuality,
  parseFormat,
  compactName,
} from './normalize'
import { resolveCountryCode, countryCodeToName } from './countryDetect'
import { isValidUrl, validateStreams } from './validate'

const FETCH_TIMEOUT = Number(process.env.FS_FETCH_TIMEOUT) || 20000
const CONCURRENCY = Number(process.env.FS_CONCURRENCY) || 8
// Optional cap on how many playlists are fetched per index source (bounded test runs).
const MAX_PLAYLISTS = Number(process.env.FS_MAX_PLAYLISTS) || 0

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 FreeStream/1.0' },
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

function rawFromEntry(
  entry: ReturnType<typeof parseM3U>[number],
  source: string,
): RawChannel | null {
  if (!isValidUrl(entry.url)) return null
  return {
    id: entry.id,
    name: entry.name || entry.url,
    logo: entry.logo,
    group: entry.group,
    language: entry.language,
    country: entry.country,
    countryCode: entry.countryCode,
    url: entry.url,
    source,
    attributes: entry.attributes,
    epgId: entry.epgId,
  }
}

async function fetchM3UList(urls: string[], source: string): Promise<RawChannel[]> {
  const out: RawChannel[] = []
  let idx = 0
  let done = 0
  async function worker() {
    while (idx < urls.length) {
      const url = urls[idx++]
      try {
        const text = await fetchText(url)
        const entries = parseM3U(text)
        for (const e of entries) {
          const raw = rawFromEntry(e, source)
          if (raw) out.push(raw)
        }
      } catch {
        // Fault tolerant: a single dead playlist never blocks the source.
      }
      done++
      if (done % 10 === 0) {
        console.log(`  [${source}] ${done}/${urls.length} playlists, ${out.length} chaînes`)
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, urls.length) }, () => worker()),
  )
  console.log(`  [${source}] terminé: ${out.length} chaînes brutes`)
  return out
}

async function fetchSource(
  source: SourceConfig,
): Promise<{ channels: RawChannel[]; errors: string[] }> {
  const errors: string[] = []
  try {
    if (source.type === 'm3u') {
      const channels = await fetchM3UList([source.url!], source.id)
      return { channels, errors }
    }
    if (source.type === 'm3u-index') {
      const indexText = await fetchText(source.url!)
      const indexEntries = parseM3U(indexText)
      let playlistUrls = indexEntries
        .map((e) => e.url)
        .filter((u) => isPlaylistUrl(u) && isValidUrl(u))
      if (MAX_PLAYLISTS > 0) playlistUrls = playlistUrls.slice(0, MAX_PLAYLISTS)
      const channels = await fetchM3UList(playlistUrls, source.id)
      return { channels, errors }
    }
    if (source.type === 'github') {
      const urls = (source.paths || []).map(
        (p) =>
          `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${source.branch}/${encodeURI(p)}`,
      )
      const channels = await fetchM3UList(urls, source.id)
      return { channels, errors }
    }
  } catch (err: any) {
    errors.push(String(err?.message || err))
  }
  return { channels: [], errors }
}

export interface AggregateOptions {
  validate?: boolean
  validateMax?: number
  validateConcurrency?: number
}

export async function aggregateAll(
  opts: AggregateOptions = {},
): Promise<{ catalog: AggregatedChannel[]; stats: SyncStats }> {
  const stats: SyncStats = {
    startedAt: new Date().toISOString(),
    perSource: {},
    totalRaw: 0,
    afterDedup: 0,
    duplicatesRemoved: 0,
    streamsTotal: 0,
    streamsValidated: 0,
    streamsWorking: 0,
    streamsInvalid: 0,
    streamsUnverified: 0,
    sourcesEnabled: 0,
    sourcesFailed: [],
  }

  const enabled = SOURCES.filter((s) => s.enabled)
  stats.sourcesEnabled = enabled.length

  // Fetch every source in parallel; each source is fault tolerant on its own.
  const results = await Promise.all(
    enabled.map(async (s) => {
      const r = await fetchSource(s)
      stats.perSource[s.id] = {
        fetched: r.channels.length,
        parsed: r.channels.length,
        errors: r.errors,
      }
      if (r.errors.length) stats.sourcesFailed.push(s.id)
      return r.channels
    }),
  )

  const allRaw: RawChannel[] = results.flat()
  stats.totalRaw = allRaw.length

  // Deduplicate into a unified catalog (O(n) using indexed Maps).
  const catalog: AggregatedChannel[] = []
  let duplicates = 0
  const byName = new Map<string, number[]>()
  const byUrl = new Map<string, number>()
  for (const raw of allRaw) {
    const urlKey = normalizeUrl(raw.url)
    // Level 3 — same stream URL (catches cross-name duplicates).
    let existingIdx = urlKey ? byUrl.get(urlKey) : undefined
    // Level 1/2 — name + country bucket, then precise isDuplicate check.
    if (existingIdx === undefined) {
      const nameKey =
        compactName(raw.name) + '|' + (raw.countryCode || '').toLowerCase()
      const bucket = byName.get(nameKey)
      if (bucket) {
        for (const idx of bucket) {
          if (isDuplicate(catalog[idx], raw)) {
            existingIdx = idx
            break
          }
        }
      }
    }
    if (existingIdx !== undefined) {
      catalog[existingIdx] = mergeChannelData(catalog[existingIdx], raw)
      // Keep the URL index fresh for any newly merged stream.
      for (const s of catalog[existingIdx].streams) {
        const k = normalizeUrl(s.url)
        if (k && !byUrl.has(k)) byUrl.set(k, existingIdx)
      }
      duplicates++
    } else {
      const detectedLang = detectLanguageFromName(raw.name)
      const detectedCountry = resolveCountryCode({
        country: raw.country,
        countryCode: raw.countryCode,
        epgId: raw.epgId,
        id: raw.id,
        url: raw.url,
        group: raw.group,
        language: raw.language,
        name: raw.name,
      })
      const idx = catalog.length
      catalog.push({
        id:
          normalizeId(raw.id || raw.epgId) ||
          normalizeId(raw.name + (raw.countryCode || '')),
        name: raw.name,
        country: countryCodeToName(detectedCountry),
        countryCode: detectedCountry,
        languages: raw.language
          ? [raw.language]
          : detectedLang
            ? [detectedLang]
            : undefined,
        categories: raw.group ? [raw.group] : undefined,
        logo: raw.logo,
        epgId: raw.epgId || raw.id,
        isLive: true,
        sources: [raw.source],
        streams: [
          {
            url: raw.url,
            quality: parseQuality(raw.url, raw.attributes),
            format: parseFormat(raw.url),
            source: raw.source,
            verified: null,
          },
        ],
      })
      const nameKey =
        compactName(raw.name) + '|' + (raw.countryCode || '').toLowerCase()
      const arr = byName.get(nameKey)
      if (arr) arr.push(idx)
      else byName.set(nameKey, [idx])
      if (urlKey) byUrl.set(urlKey, idx)
    }
  }

  // Guarantee unique ids. Two distinct channels can legitimately share a
  // tvg-id/name-derived id (e.g. same tvg-id from different sources with
  // different streams). Collisions would break React keys and /watch/{id}
  // lookups, so we suffix duplicates deterministically.
  const seenIds = new Set<string>()
  for (const c of catalog) {
    let id = c.id
    if (!id) id = `ch${seenIds.size + 1}`
    if (seenIds.has(id)) {
      let n = 2
      while (seenIds.has(`${id}-${n}`)) n++
      id = `${id}-${n}`
    }
    c.id = id
    seenIds.add(id)
  }

  stats.afterDedup = catalog.length
  stats.duplicatesRemoved = duplicates
  stats.streamsTotal = catalog.reduce((acc, c) => acc + c.streams.length, 0)
  console.log(
    `Déduplication: ${allRaw.length} brutes -> ${catalog.length} chaînes (${duplicates} doublons)`,
  )

  const sourcePriority = getSourcePriorityMap()

  // Pick the best stream per channel and surface its quality/source.
  for (const c of catalog) {
    const best = selectBestStream(c.streams, sourcePriority)
    if (best) {
      c.quality = best.quality
      c.source = best.source
    }
  }

  // Optional, bounded stream validation.
  if (opts.validate) {
    const allStreams = catalog.flatMap((c) =>
      c.streams.map((s) => ({ url: s.url, source: s.source })),
    )
    const cap = opts.validateMax ?? allStreams.length
    const validated = await validateStreams(allStreams, {
      concurrency: opts.validateConcurrency ?? 12,
      max: cap,
      timeoutMs: 6000,
    })
    stats.validationCapped = cap < allStreams.length
    const okMap = new Map(validated.map((v) => [v.url.toLowerCase().trim(), v.ok]))
    let working = 0
    let invalid = 0
    for (const c of catalog) {
      for (const s of c.streams) {
        const v = okMap.get(s.url.toLowerCase().trim())
        if (v === true) {
          s.verified = true
          working++
        } else if (v === false) {
          s.verified = false
          invalid++
        }
      }
    }
    stats.streamsValidated = validated.length
    stats.streamsWorking = working
    stats.streamsInvalid = invalid
    stats.streamsUnverified = stats.streamsTotal - working - invalid
  } else {
    stats.streamsUnverified = stats.streamsTotal
  }

  stats.finishedAt = new Date().toISOString()
  return { catalog, stats }
}
