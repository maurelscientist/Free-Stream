import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const target = url.searchParams.get('url') || ''
    if (!target) return NextResponse.json({ ok: false, error: 'missing url' }, { status: 400 })

    try {
      const parsed = new URL(target)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return NextResponse.json({ ok: false, error: 'invalid scheme' }, { status: 400 })
      }
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'invalid url' }, { status: 400 })
    }

    try {
      const res = await fetch(target, { method: 'HEAD', redirect: 'follow' })
      return NextResponse.json({ ok: res.ok, status: res.status, finalUrl: res.url })
    } catch (err) {
      return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 502 })
    }
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
