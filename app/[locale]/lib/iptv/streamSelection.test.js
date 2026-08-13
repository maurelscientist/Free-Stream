const test = require('node:test')
const assert = require('node:assert/strict')
const { buildStreamCandidates } = require('./streamSelection.js')

test('prioritizes HLS and playlist-like sources', () => {
  const candidates = buildStreamCandidates([
    { url: 'https://example.com/video.mp4' },
    { url: 'https://example.com/playlist.m3u8' },
    { url: 'https://example.com/stream.m3u' },
    { url: 'https://example.com/other' },
  ])

  assert.deepEqual(candidates.map((item) => item.url), [
    'https://example.com/playlist.m3u8',
    'https://example.com/stream.m3u',
    'https://example.com/video.mp4',
    'https://example.com/other',
  ])
})
