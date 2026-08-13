function parsePlaylistEntries(raw) {
  const lines = String(raw || '').split(/\r?\n/)
  const entries = []
  let current = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('#EXTINF:')) {
      current = {
        id: undefined,
        name: undefined,
        logo: undefined,
        languages: [],
        categories: [],
        country: undefined,
        streamUrl: undefined,
      }

      const attrs = {}
      const attrRegex = /([^=\s]+?)="([^"]*)"/g
      let match
      while ((match = attrRegex.exec(trimmed)) !== null) {
        attrs[match[1]] = match[2]
      }

      const titleMatch = trimmed.match(/,(.*)$/)
      const title = titleMatch?.[1]?.trim() || ''

      current.id = attrs['tvg-id'] || attrs['tvg-name'] || undefined
      current.name = attrs['tvg-name'] || title || undefined
      current.logo = attrs['tvg-logo'] || undefined
      current.country = attrs['tvg-country'] || attrs['country'] || undefined
      current.languages = (attrs['tvg-language'] || '')
        .split(';')
        .map((value) => value.trim())
        .filter(Boolean)
      current.categories = (attrs['group-title'] || '')
        .split(';')
        .map((value) => value.trim())
        .filter(Boolean)

      continue
    }

    if (!current || trimmed.startsWith('#')) continue

    entries.push({
      ...current,
      streamUrl: trimmed,
      name: current.name || trimmed,
    })
    current = null
  }

  return entries
}

module.exports = { parsePlaylistEntries }
