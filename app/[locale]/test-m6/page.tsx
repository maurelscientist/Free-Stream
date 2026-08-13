"use client"
import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

const MASTER = 'http://99.27.51.147:8080/M6/index.m3u8'

async function getMediaPlaylistUrl(masterUrl: string): Promise<string | null> {
  try {
    const res = await fetch(masterUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) return null
    const text = await res.text()
    const lines = text.split('\n').map((l) => l.trim())
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('#EXT-X-STREAM-INF') || lines[i].startsWith('#EXT-X-I-FRAME-STREAM-INF')) {
        const uri = lines[i + 1]
        if (uri && !uri.startsWith('#')) return new URL(uri, masterUrl).href
      }
    }
    return null
  } catch {
    return null
  }
}

export default function TestM6() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [log, setLog] = useState<string[]>([])
  const add = (s: string) => setLog((l) => [...l, s])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.playsInline = true

    let hls: any = null
    let fallbackDone = false

    const onError = async (_e: any, d: any) => {
      add(`ERROR ${d.details} fatal=${d.fatal}`)
      if (d.details === 'manifestIncompatibleCodecsError' && d.fatal && !fallbackDone) {
        fallbackDone = true
        add('-> trying media playlist fallback on SAME instance')
        const media = await getMediaPlaylistUrl(MASTER)
        add('media url: ' + media)
        if (media && media !== MASTER) {
          hls.loadSource(media)
          return
        }
      }
      add('-> no fallback, giving up')
    }

    if (Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(MASTER)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => add('MANIFEST_PARSED levels=' + hls.levels.length))
      hls.on(Hls.Events.ERROR, onError)
    }

    return () => { hls?.destroy() }
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>M6 AC-3 test</h1>
      <video ref={videoRef} controls muted playsInline style={{ width: '100%', background: 'black', height: 360 }} />
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{log.join('\n')}</pre>
    </div>
  )
}
