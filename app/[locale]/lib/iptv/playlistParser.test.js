const test = require('node:test')
const assert = require('node:assert/strict')
const { parsePlaylistEntries } = require('./playlistParser')

test('parses best playlist entries with metadata and stream URL', () => {
  const raw = `#EXTM3U x-tvg-url="https://example.com/guide.xml.gz"
#EXTINF:-1 tvg-id="France24.fr" tvg-name="France 24" tvg-logo="https://example.com/logo.png" tvg-country="FR" tvg-language="eng;fra" group-title="News",France 24
https://example.com/france24.m3u8
`

  const entries = parsePlaylistEntries(raw)

  assert.equal(entries.length, 1)
  assert.equal(entries[0].id, 'France24.fr')
  assert.equal(entries[0].name, 'France 24')
  assert.equal(entries[0].logo, 'https://example.com/logo.png')
  assert.equal(entries[0].streamUrl, 'https://example.com/france24.m3u8')
  assert.deepEqual(entries[0].languages, ['eng', 'fra'])
  assert.deepEqual(entries[0].categories, ['News'])
})
