// Shared types for the Free Stream multi-source IPTV aggregator.

export interface RawChannel {
  id?: string
  name: string
  logo?: string
  group?: string
  language?: string
  country?: string
  countryCode?: string
  url: string
  source: string
  attributes?: Record<string, string>
  epgId?: string
}

export interface NormalizedStream {
  url: string
  quality?: string
  format?: string
  source?: string
  verified?: boolean | null
}

export interface AggregatedChannel {
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
  streams: NormalizedStream[]
}

export type SourceType = 'm3u-index' | 'm3u' | 'github'

export interface SourceConfig {
  id: string
  name: string
  type: SourceType
  url?: string
  owner?: string
  repo?: string
  branch?: string
  paths?: string[]
  priority: number
  enabled: boolean
  note?: string
}

export interface SourceStat {
  fetched: number
  parsed: number
  errors: string[]
}

export interface SyncStats {
  startedAt: string
  finishedAt?: string
  perSource: Record<string, SourceStat>
  totalRaw: number
  afterDedup: number
  duplicatesRemoved: number
  streamsTotal: number
  streamsValidated: number
  streamsWorking: number
  streamsInvalid: number
  streamsUnverified: number
  sourcesEnabled: number
  sourcesFailed: string[]
  validationCapped?: boolean
}

export type SyncState = 'idle' | 'running' | 'done' | 'error'

export interface SyncStatus {
  state: SyncState
  lastRunAt?: string
  lastSuccessAt?: string
  stats?: SyncStats
  message?: string
}
