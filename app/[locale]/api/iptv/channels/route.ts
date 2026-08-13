import { NextResponse } from 'next/server'
import { fetchChannels } from '../../../lib/iptv'
import { filterChannelsQuery } from '../../../../lib/iptv/queryChannels'
import { getCache, setCache } from '../../../lib/cache'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const search = url.searchParams.get('q') || ''
    const country = url.searchParams.get('country') || ''
    const category = url.searchParams.get('category') || ''
    const quality = url.searchParams.get('quality') || ''
    const language = url.searchParams.get('language') || ''
    const source = url.searchParams.get('source') || ''
    const live = url.searchParams.get('live') || ''
    const page = parseInt(url.searchParams.get('page') || '1', 10) || 1
    const pageSizeParam = url.searchParams.get('pageSize')
    const pageSize = pageSizeParam
      ? Math.min(parseInt(pageSizeParam, 10) || 48, 20000)
      : undefined

    const cacheKey = `channels:${search}:${country}:${category}:${quality}:${language}:${source}:${live}:${page}:${pageSize ?? 'all'}`
    const cached = getCache<any>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const cachedChannels = getCache<any[]>('channels:all')
    const channels = cachedChannels ?? (await fetchChannels())
    if (!cachedChannels) setCache('channels:all', channels, 60 * 5) // cache full set 5min

    const filtered = filterChannelsQuery(channels, {
      q: search,
      country,
      category,
      quality,
      language,
      source,
      live,
    })

    const total = filtered.length
    let paged = filtered
    if (pageSize !== undefined) {
      const start = (page - 1) * pageSize
      paged = filtered.slice(start, start + pageSize)
    }

    const result = { data: paged, total }
    setCache(cacheKey, result, 30)
    return NextResponse.json(result)
  } catch (err) {
    console.error('IPTV API error', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Impossible de récupérer les chaînes' }, { status: 500 })
  }
}
