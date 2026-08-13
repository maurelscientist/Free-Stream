import { SourceConfig } from './types'

// Central registry of all IPTV sources aggregated by Free Stream.
//
// Discovery notes (no URLs were invented; all were resolved from the public
// projects referenced by the user):
//  - iptv-org:        master playlist `index.m3u` is the FULL channel list (one entry per
//                     channel, not per-category). It is fetched directly as a single M3U.
//  - Free-TV/IPTV:    single public `playlist.m3u8` on the default branch.
//  - CCSH/IPTV:       GitHub tree (main) -> live.m3u, live_lite.m3u, live_platforms.m3u.
//  - fanmingming/live:GitHub tree (main) -> tv/m3u/*.m3u, radio/m3u/*.m3u, worker/radio.m3u.
//  - imDazui/...:     GitHub tree (master) -> 224 playlists in `m3u/`; a curated subset of
//                     the clearly-labelled aggregate lists is used to avoid excessive
//                     China-only duplication while still adding many channels.
//  - m3u8-xtream/...: EXCLUDED. The repository does not expose a public M3U/M3U8 playlist;
//                     it only contains provider-specific Xtream Codes API sample JSON
//                     (tied to a specific provider id). It is disabled to respect licensing
//                     and usage constraints.

export const SOURCES: SourceConfig[] = [
  {
    id: 'iptv-org',
    name: 'iptv-org',
    type: 'm3u',
    url: 'https://iptv-org.github.io/iptv/index.m3u',
    priority: 90,
    enabled: true,
  },
  {
    id: 'fanmingming',
    name: 'fanmingming/live',
    type: 'github',
    owner: 'fanmingming',
    repo: 'live',
    branch: 'main',
    paths: [
      'tv/m3u/index.m3u',
      'tv/m3u/demo.m3u',
      'tv/m3u/ipv6.m3u',
      'tv/m3u/itv.m3u',
      'radio/m3u/index.m3u',
      'radio/m3u/fm.m3u',
      'worker/radio.m3u',
    ],
    priority: 80,
    enabled: true,
  },
  {
    id: 'free-tv',
    name: 'Free-TV/IPTV',
    type: 'm3u',
    url: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8',
    priority: 70,
    enabled: true,
  },
  {
    id: 'ccsh',
    name: 'CCSH/IPTV',
    type: 'github',
    owner: 'CCSH',
    repo: 'IPTV',
    branch: 'main',
    paths: ['live.m3u', 'live_lite.m3u', 'live_platforms.m3u'],
    priority: 60,
    enabled: true,
  },
  {
    id: 'imdazui',
    name: 'imDazui/Tvlist-awesome-m3u-m3u8',
    type: 'github',
    owner: 'imDazui',
    repo: 'Tvlist-awesome-m3u-m3u8',
    branch: 'master',
    paths: [
      'm3u/3100个全部有效.m3u8',
      'm3u/5000个直播源全部有效.m3u',
      'm3u/1300个直播源全部有效【全部4k老电脑别用】.m3u8',
      'm3u/CCTV.m3u',
      'm3u/china.m3u',
      'm3u/GGTV424个源全部可用.m3u',
      'm3u/MyTVlist.m3u8',
      'm3u/LookChina.m3u',
      'm3u/LeTV.m3u',
      'm3u/ZhanQi.m3u',
      'm3u/_CCTVHD.m3u8',
      'm3u/45个影视剧场全部流畅.m3u8',
      'm3u/playlist_Lecloud.m3u',
    ],
    priority: 40,
    enabled: true,
  },
  {
    id: 'm3u8-xtream',
    name: 'm3u8-xtream/m3u8-xtream-playlist',
    type: 'github',
    owner: 'm3u8-xtream',
    repo: 'm3u8-xtream-playlist',
    branch: 'main',
    paths: [],
    priority: 0,
    enabled: false,
    note: 'Excluded: repository contains only provider-specific Xtream Codes API sample JSON, no public M3U/M3U8 playlist.',
  },
]

export function getEnabledSources(): SourceConfig[] {
  return SOURCES.filter((s) => s.enabled)
}

export function getSourcePriorityMap(): Record<string, number> {
  const map: Record<string, number> = {}
  for (const s of SOURCES) map[s.id] = s.priority
  return map
}
