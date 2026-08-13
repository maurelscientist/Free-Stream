"use client"
import React, { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { useTranslations } from 'next-intl'

type Props = {
  streamUrl?: string
  streamUrls?: string[]
  channelName?: string
  logo?: string
  autoplay?: boolean
}

function sourceLabel(url: string, index: number): string {
  try {
    const u = new URL(url)
    const path = u.pathname.replace(/\/$/, '')
    const last = path.split('/').filter(Boolean).pop() || ''
    const base = `${index + 1}. ${u.host}`
    return last ? `${base}/${last}` : base
  } catch {
    return `${index + 1}. ${url}`
  }
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

// Some DASH streams declare an audio codec the browser cannot decode (e.g. AC-3).
// dashjs aborts the whole stream in that case. We can still play the video by
// fetching the manifest, removing the audio AdaptationSet, and re-initializing
// dashjs with the video-only manifest.
async function loadVideoOnlyDash(mpdUrl: string): Promise<string | null> {
  try {
    const res = await fetch(mpdUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) return null
    const text = await res.text()
    const xml = new DOMParser().parseFromString(text, 'application/xml')
    if (xml.querySelector('parsererror')) return null
    const sets = Array.from(xml.querySelectorAll('AdaptationSet'))
    for (const s of sets) {
      const mime = (s.getAttribute('mimeType') || s.getAttribute('contentType') || '').toLowerCase()
      const isAudio = mime.startsWith('audio') || s.getAttribute('contentType') === 'audio'
      if (isAudio && s.parentNode) s.parentNode.removeChild(s)
    }
    const mpd = xml.querySelector('MPD')
    if (mpd) {
      const ns = mpd.namespaceURI || 'urn:mpeg:dash:schema:mpd:2011'
      const baseEl = xml.createElementNS(ns, 'BaseURL')
      baseEl.textContent = mpdUrl.slice(0, mpdUrl.lastIndexOf('/') + 1)
      mpd.insertBefore(baseEl, mpd.firstChild)
    }
    const serialized = new XMLSerializer().serializeToString(xml)
    const blob = new Blob([serialized], { type: 'application/dash+xml' })
    return URL.createObjectURL(blob)
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
  const watch = useTranslations('watch')

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
    const tryHls = Hls.isSupported() && (/\.m3u8(\?|$)/i.test(currentUrl) || (!isNativeMedia && !isMpd))

    let destroyed = false
    let hls: any = null
    let dash: any = null
    let nativeCleanup: (() => void) | null = null

    const fail = (msg?: string) => {
      if (destroyed) return
      if (sourceIndex < sources.length - 1) {
        setSourceIndex((prev) => prev + 1)
        return
      }
      setError(msg || watch('noStream'))
    }

    const playNative = (url: string) => {
      video.src = url
      video.load()
      const onErr = () => fail()
      video.addEventListener('error', onErr, { once: true })
      nativeCleanup = () => video.removeEventListener('error', onErr)
      if (autoplay) {
        requestAnimationFrame(() => {
          video.play().catch(() => setError(watch('autoplayFailed') ?? 'Autoplay failed'))
        })
      }
    }

    if (isMpd) {
      import('dashjs')
        .then((mod: any) => {
          if (destroyed) return
          const ns = mod && mod.default && mod.default.MediaPlayer ? mod.default : mod
          const MediaPlayer = ns && ns.MediaPlayer ? ns.MediaPlayer : undefined
          if (typeof MediaPlayer !== 'function') {
            console.warn('dashjs: MediaPlayer not found', Object.keys(mod || {}))
            playNative(currentUrl)
            return
          }
          let videoOnlyTried = false
          const startDash = (url: string) => {
            dash = MediaPlayer().create()
            dash.initialize(video, url, autoplay)
            dash.on('streamInitialized', () => console.log('dashjs: stream initialized'))
            dash.on('error', async (e: any) => {
              const msg = e?.error?.message || ''
              if (!videoOnlyTried && /audio decoder|DECODER_ERROR_NOT_SUPPORTED|kUnsupportedConfig/i.test(msg)) {
                videoOnlyTried = true
                const blobUrl = await loadVideoOnlyDash(currentUrl)
                if (blobUrl) {
                  setInfo(watch('audioUnavailable'))
                  try {
                    dash.reset()
                  } catch {
                    /* ignore */
                  }
                  startDash(blobUrl)
                  return
                }
              }
              fail()
            })
          }
          startDash(currentUrl)
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
              setInfo(watch('audioUnavailable'))
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
      if (nativeCleanup) nativeCleanup()
    }
  }, [autoplay, sourceIndex, sourceKey, sources])

  return (
    <div>
      {sources.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{watch('sources', { count: sources.length })}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSourceIndex((i) => Math.max(0, i - 1))}
              disabled={sourceIndex === 0}
              className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-slate-600 dark:text-slate-200"
              aria-label="Previous source"
            >
              ‹
            </button>
            <select
              value={sourceIndex}
              onChange={(e) => setSourceIndex(Number(e.target.value))}
              className="max-w-xs truncate rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              aria-label={watch('sources', { count: sources.length })}
            >
              {sources.map((url, i) => (
                <option key={i} value={i} title={url}>
                  {sourceLabel(url, i)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSourceIndex((i) => Math.min(sources.length - 1, i + 1))}
              disabled={sourceIndex === sources.length - 1}
              className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-slate-600 dark:text-slate-200"
              aria-label="Next source"
            >
              ›
            </button>
          </div>
        </div>
      )}
      <div className="relative bg-black rounded overflow-hidden">
        <video ref={videoRef} controls playsInline className="w-full aspect-video bg-black" />
        {!playing && (
          <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1.5 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white shadow">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            {watch('live')}
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
        <div className="mt-2 p-3 bg-amber-50 text-amber-700 rounded dark:bg-amber-900/30 dark:text-amber-300">{info}</div>
      )}
      {info && (
        <div className="mt-2 p-3 bg-amber-50 text-amber-700 rounded dark:bg-amber-900/30 dark:text-amber-300">{info}</div>
      )}
      {error && (
        <div className="mt-2 p-3 bg-red-50 text-red-700 rounded dark:bg-red-900/30 dark:text-red-300">{error}</div>
      )}
    </div>
  )
}
