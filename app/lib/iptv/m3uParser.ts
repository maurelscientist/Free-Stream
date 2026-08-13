// Robust M3U / M3U8 parser.
// Handles #EXTINF attribute extraction, title separation and master playlists
// (an #EXTINF whose URL points to another .m3u/.m3u8 file).

export interface ParsedEntry {
  id?: string
  name: string
  logo?: string
  group?: string
  language?: string
  country?: string
  countryCode?: string
  url: string
  attributes: Record<string, string>
  epgId?: string
}

const ATTR_REGEX = /([a-zA-Z0-9_-]+)="([^"]*)"/g

export function parseM3U(raw: string): ParsedEntry[] {
  const lines = String(raw || '').split(/\r?\n/)
  const entries: ParsedEntry[] = []
  let current: Partial<ParsedEntry> | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('#EXTINF:')) {
      const attrs: Record<string, string> = {}
      let m: RegExpExecArray | null
      ATTR_REGEX.lastIndex = 0
      while ((m = ATTR_REGEX.exec(trimmed)) !== null) {
        attrs[m[1]] = m[2]
      }

      const commaIndex = trimmed.lastIndexOf(',')
      const title = commaIndex >= 0 ? trimmed.slice(commaIndex + 1).trim() : ''

      const tvgId = attrs['tvg-id'] || attrs['tvg-name'] || undefined
      const tvgName = attrs['tvg-name'] || title || undefined
      const country = attrs['tvg-country'] || attrs['country'] || undefined

      current = {
        id: tvgId,
        name: tvgName,
        logo: attrs['tvg-logo'] || undefined,
        group: attrs['group-title'] || undefined,
        language: attrs['tvg-language'] || undefined,
        country,
        countryCode: country,
        attributes: attrs,
        epgId: tvgId,
      }
      continue
    }

    if (trimmed.startsWith('#')) continue
    if (!current) continue

    const name = current.name || trimmed
    entries.push({
      id: current.id,
      name,
      logo: current.logo,
      group: current.group,
      language: current.language,
      country: current.country,
      countryCode: current.countryCode,
      url: trimmed,
      attributes: current.attributes || {},
      epgId: current.epgId,
    })
    current = null
  }

  return entries
}

export function isPlaylistUrl(url: string): boolean {
  return /\.(m3u8?|m3u)(\?|$)/i.test(url)
}
