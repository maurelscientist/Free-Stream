"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import Hls from 'hls.js'

type Props = {
  streamUrl?: string
  streamUrls?: string[]
  channelName?: string
  logo?: string
  autoplay?: boolean
}

// Some streams (e.g. M6) declare AC-3/Dolby audio in the master playlist.
// Browsers like Chrome on Windows cannot decode AC-3, so hls.js aborts with a
// fatal manifestIncompatibleCodecsError. We can still play the video by loading
// the media (variant) playlist directly, which drops the unsupported audio track.
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

export default function VideoPlayer({ streamUrl, streamUrls, channelName, logo, autoplay = false }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [sourceIndex, setSourceIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const t = useTranslations('watch')

  const sources = (streamUrls && streamUrls.length > 0 ? streamUrls : streamUrl ? [streamUrl] : []).filter(Boolean)
  const sourceKey = sources.join('|')

  useEffect(() => {
    setError(null)
    setInfo(null)
    setSourceIndex(0)
    setPlaying(false)
  }, [sourceKey])

  useEffect(() => {
    const video = videoRef.current
    if (!video || sources.length === 0) return

    const currentUrl = sources[sourceIndex]
    if (!currentUrl) return

    video.muted = true
    video.autoplay = true
    video.playsInline = true
    video.preload = 'auto'

    const onPlaying = () => setPlaying(true)
    video.addEventListener('playing', onPlaying)

    const isMpd = /\.mpd(\?|$)/i.test(currentUrl)
    const isNativeMedia = /\.(mp4|webm|ogg|ogv|mov|m4v|mkv|mp3|aac|flv)(\?|$)/i.test(currentUrl)
    // Treat any non-native, non-DASH URL as HLS (covers extension-less IPTV
    // panel URLs like /play/xxx or ?id=... that are actually HLS manifests).
    const tryHls = Hls.isSupported() && (/\.m3u8(\?|$)/i.test(currentUrl) || (!isNativeMedia && !isMpd))
    console.log('[VP] engine', isMpd ? 'dash' : tryHls ? 'hls' : 'native', currentUrl)

    let destroyed = false
    let hls: any = null
    let dash: any = null

    const fail = (msg?: string) => {
      if (destroyed) return
      if (sourceIndex < sources.length - 1) {
        setSourceIndex((prev) => prev + 1)
        return
      }
      setError(msg || t('streamUnavailable'))
    }

    const playNative = (url: string) => {
      video.src = url
      video.load()
      video.addEventListener('error', () => fail(), { once: true })
    }

    if (isMpd) {
      import('dashjs')
        .then((mod: any) => {
          if (destroyed) return
          const ns = mod && mod.default && mod.default.MediaPlayer ? mod.default : mod
          const MediaPlayer = ns && ns.MediaPlayer ? ns.MediaPlayer : undefined
          if (typeof MediaPlayer !== 'function') {
            console.warn('dashjs: MediaPlayer not found', Object.keys(mod || {}), Object.keys(mod?.default || {}))
            playNative(currentUrl)
            return
          }
          dash = MediaPlayer().create()
          dash.initialize(video, currentUrl, autoplay)
          dash.on('streamInitialized', () => console.log('dashjs: stream initialized'))
          dash.on('error', (e: any) => { console.warn('dashjs error event', e?.error?.code, e?.error?.message); fail() })
        })
        .catch((e: any) => {
          console.warn('dashjs import failed', e?.message)
          playNative(currentUrl)
        })
    } else if (tryHls) {
      hls = new Hls()
      hls.loadSource(currentUrl)
      hls.attachMedia(video)
      let codecFallbackDone = false
      let nativeTried = false
      hls.on(Hls.Events.ERROR, async (_event: any, data: any) => {
        if (data?.details === 'manifestIncompatibleCodecsError' && data.fatal && !codecFallbackDone) {
          codecFallbackDone = true
          try {
            const mediaUrl = await getMediaPlaylistUrl(currentUrl)
            if (mediaUrl && mediaUrl !== currentUrl) {
              setInfo(t('audioUnavailable'))
              hls.loadSource(mediaUrl)
              return
            }
          } catch {
            /* fall through */
          }
        }
        if (!data?.fatal) return
        const detail = data?.details || ''
        const isNetwork = /network|loadError|Timeout/i.test(detail)
        if (!isNetwork && !nativeTried) {
          // hls.js could not parse this as HLS (extension-less panel URL,
          // direct file, etc.) -> fall back to native playback once.
          nativeTried = true
          hls.destroy()
          playNative(currentUrl)
          return
        }
        fail()
      })
    } else {
      playNative(currentUrl)
    }

    return () => {
      destroyed = true
      video.removeEventListener('playing', onPlaying)
      if (hls) hls.destroy()
      if (dash) {
        try {
          dash.reset()
        } catch {
          /* ignore */
        }
      }
    }
  }, [autoplay, sourceIndex, sourceKey, sources])

  return (
    <div>
      <div className="relative bg-black rounded overflow-hidden">
        <video ref={videoRef} controls playsInline className="w-full h-64 bg-black" />
        {!playing && (
          <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1.5 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white shadow">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            {t('live')}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-semibold">{channelName}</div>
        </div>
        <div />
      </div>
      {info && (
        <div className="mt-2 p-3 bg-amber-50 text-amber-700 rounded">{info}</div>
      )}
      {error && (
        <div className="mt-2 p-3 bg-red-50 text-red-700 rounded">{error}</div>
      )}
    </div>
  )
}
