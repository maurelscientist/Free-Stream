import { NextResponse } from 'next/server'
import { getCache, setCache } from '../../lib/cache'

const SPORTS_API = 'https://livewatch.top/api/v1/public/sports'
const CACHE_TTL = 5 * 60 // 5 minutes
const FETCH_TIMEOUT = 10000

export type SportsEmbed = { label: string; embed_url: string }

export type SportsEvent = {
  id: string
  title: string
  sport: string
  league: string
  time: string
  is_live: boolean
  popular: boolean
  home: string
  away: string
  home_badge: string
  away_badge: string
  embeds: SportsEmbed[]
}

export type SportsPayload = {
  total: number
  sports: string[]
  sport_counts: Record<string, number>
  live_count: number
  popular_count: number
  events: SportsEvent[]
}

// Ensure every event has a unique id. The upstream API can return the same
// id twice (e.g. the same PPV event listed in two sections), which breaks
// React keys in the UI. Suffix collisions with -2, -3, ... like aggregate.ts.
function ensureUniqueIds(events: SportsEvent[]): SportsEvent[] {
  const seen = new Map<string, number>()
  return events.map((e) => {
    const count = seen.get(e.id) ?? 0
    seen.set(e.id, count + 1)
    if (count === 0) return e
    return { ...e, id: `${e.id}-${count + 1}` }
  })
}

const EMPTY: SportsPayload = {
  total: 0,
  sports: [],
  sport_counts: {},
  live_count: 0,
  popular_count: 0,
  events: [],
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const sport = url.searchParams.get('sport') || ''
    const live = url.searchParams.get('live') === '1' || url.searchParams.get('live') === 'true'
    const popular =
      url.searchParams.get('popular') === '1' || url.searchParams.get('popular') === 'true'

    const cacheKey = `sports:${sport}:${live}:${popular}`
    const cached = getCache<SportsPayload>(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Reuse the full payload if already fetched.
    let payload = getCache<SportsPayload>('sports:all')

    if (!payload) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
      try {
        const res = await fetch(SPORTS_API, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 FreeStream/1.0' },
        })
        clearTimeout(timer)
        if (!res.ok) throw new Error('HTTP ' + res.status)
        payload = (await res.json()) as SportsPayload
        payload.events = ensureUniqueIds(payload.events)
      } finally {
        clearTimeout(timer)
      }
      setCache('sports:all', payload, CACHE_TTL)
    }

    let events = payload.events
    if (sport) events = events.filter((e) => e.sport === sport)
    if (live) events = events.filter((e) => e.is_live)
    if (popular) events = events.filter((e) => e.popular)

    const result: SportsPayload = { ...payload, events, total: events.length }
    setCache(cacheKey, result, CACHE_TTL)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Sports API error', err)
    // Graceful fallback: serve last good payload or empty data.
    const fallback = getCache<SportsPayload>('sports:all')
    if (fallback) return NextResponse.json(fallback)
    return NextResponse.json(EMPTY, { status: 200 })
  }
}
