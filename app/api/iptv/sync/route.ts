import { NextResponse } from 'next/server'
import { syncCatalog, getSyncStatus, isSyncRunning } from '../../../lib/iptv'

// GET  -> current synchronization status (last run, stats, state).
// POST -> trigger a synchronization. Options (JSON body):
//   { "validate": true, "validateMax": 500 }
// Validation is best-effort and bounded so it never blocks the site.
export async function GET() {
  return NextResponse.json(getSyncStatus())
}

export async function POST(request: Request) {
  try {
    if (isSyncRunning()) {
      return NextResponse.json(
        { state: 'running', message: 'Une synchronisation est déjà en cours.' },
        { status: 409 },
      )
    }

    let validate = false
    let validateMax: number | undefined
    try {
      const body = await request.json()
      validate = Boolean(body?.validate)
      if (typeof body?.validateMax === 'number') validateMax = body.validateMax
    } catch {
      // no body -> default (no validation)
    }

    // Fire-and-forget: do not block the HTTP response on the (long) sync.
    const promise = syncCatalog({ validate, validateMax })
    promise.catch(() => {})

    return NextResponse.json(
      { state: 'running', message: 'Synchronisation démarrée.', validate, validateMax },
      { status: 202 },
    )
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Échec du déclenchement' },
      { status: 500 },
    )
  }
}
