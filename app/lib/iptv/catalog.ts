import fs from 'fs'
import path from 'path'
import { aggregateAll, AggregateOptions } from './aggregate'
import { AggregatedChannel, SyncStats, SyncStatus } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json')
const STATUS_FILE = path.join(DATA_DIR, 'sync-status.json')

// How long a file-backed catalog is considered fresh before a background
// refresh is triggered on the next request.
const TTL_MS = 6 * 60 * 60 * 1000

let memoryCatalog: AggregatedChannel[] | null = null
let memoryStatus: SyncStatus = { state: 'idle' }
let syncPromise: Promise<SyncStats> | null = null

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function loadFromFile<T>(file: string): T | null {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')) as T
  } catch {
    // ignore corrupt cache
  }
  return null
}

function saveToFile(file: string, data: unknown) {
  ensureDir()
  fs.writeFileSync(file, JSON.stringify(data), 'utf8')
}

export function getSyncStatus(): SyncStatus {
  return memoryStatus
}

export function isSyncRunning(): boolean {
  return syncPromise !== null
}

/**
 * Run a full aggregation and persist the result. Fault tolerant: a failure in
 * one source never aborts the others, and a failed sync keeps the previous
 * catalog/status intact.
 */
export function syncCatalog(opts: AggregateOptions = {}): Promise<SyncStats> {
  if (syncPromise) return syncPromise

  syncPromise = (async () => {
    memoryStatus = {
      state: 'running',
      lastRunAt: new Date().toISOString(),
      message: 'Synchronisation des sources en cours...',
    }
    try {
      const { catalog, stats } = await aggregateAll(opts)
      memoryCatalog = catalog
      memoryStatus = {
        state: 'done',
        lastRunAt: stats.startedAt,
        lastSuccessAt: stats.finishedAt,
        stats,
        message: 'Synchronisation terminée',
      }
      saveToFile(CATALOG_FILE, catalog)
      saveToFile(STATUS_FILE, memoryStatus)
      return stats
    } catch (err: any) {
      memoryStatus = {
        ...memoryStatus,
        state: 'error',
        message: String(err?.message || err),
      }
      throw err
    } finally {
      syncPromise = null
    }
  })()

  return syncPromise
}

/**
 * Get the unified catalog. Loads from memory, then from disk. If the on-disk
 * catalog is stale, a background refresh is kicked off (fire-and-forget) while
 * the stale data keeps serving requests so the site never blocks.
 */
export function getCatalog(opts: { forceRefresh?: boolean } = {}): AggregatedChannel[] {
  if (memoryCatalog && !opts.forceRefresh) return memoryCatalog

  const fromFile = loadFromFile<AggregatedChannel[]>(CATALOG_FILE)
  if (fromFile && fromFile.length) {
    memoryCatalog = fromFile
    const status = loadFromFile<SyncStatus>(STATUS_FILE)
    const stale =
      !status?.lastSuccessAt ||
      Date.now() - new Date(status.lastSuccessAt).getTime() > TTL_MS
    if (stale && !syncPromise) {
      syncCatalog({ validate: false }).catch(() => {})
    }
    return fromFile
  }

  // No catalog yet: trigger a best-effort background sync and return empty
  // (fault tolerant — the UI simply shows no channels until the first sync).
  if (!syncPromise) syncCatalog({ validate: false }).catch(() => {})
  return memoryCatalog || []
}
