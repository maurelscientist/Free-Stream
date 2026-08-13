import { NextResponse } from 'next/server'
import { SOURCES } from '../../../lib/iptv/sources'
import { getSyncStatus } from '../../../lib/iptv'

// Lists the IPTV sources integrated into Free Stream, with their last-known
// per-source channel counts (from the most recent synchronization).
export async function GET() {
  const status = getSyncStatus()
  const perSource = status.stats?.perSource || {}

  const sources = SOURCES.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    priority: s.priority,
    enabled: s.enabled,
    note: s.note,
    lastFetched: perSource[s.id]?.fetched ?? null,
    lastErrors: perSource[s.id]?.errors ?? [],
  }))

  return NextResponse.json({
    sources,
    syncState: status.state,
    lastSuccessAt: status.lastSuccessAt,
  })
}
