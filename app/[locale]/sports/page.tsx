"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import BackButton from '../components/BackButton'
import type { SportsEvent, SportsPayload } from '../../api/sports/route'

export default function SportsPage() {
  const t = useTranslations('sports')
  const common = useTranslations('common')
  const locale = useLocale()

  const [data, setData] = useState<SportsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeSport, setActiveSport] = useState('all')
  const [showLive, setShowLive] = useState(false)
  const [showPopular, setShowPopular] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')

  const [selected, setSelected] = useState<SportsEvent | null>(null)
  const [activeEmbed, setActiveEmbed] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch('/api/sports')
      .then((r) => r.json())
      .then((d: SportsPayload) => setData(d))
      .catch(() => setError(common('error')))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    let ev = data.events
    if (activeSport !== 'all') ev = ev.filter((e) => e.sport === activeSport)
    if (showLive) ev = ev.filter((e) => e.is_live)
    if (showPopular) ev = ev.filter((e) => e.popular)
    if (search) {
      const q = search.toLowerCase()
      ev = ev.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.sport.toLowerCase().includes(q) ||
          (e.league || '').toLowerCase().includes(q),
      )
    }
    return ev
  }, [data, activeSport, showLive, showPopular, search])

  const openEvent = (e: SportsEvent) => {
    setSelected(e)
    setActiveEmbed(0)
  }

  const tabClass = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition ${
      active
        ? 'bg-indigo-600 text-white shadow'
        : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
    }`

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />

        <header className="mt-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Free Stream
              </p>
              <h2 className="text-2xl font-semibold">{t('title')}</h2>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t('count', { count: filtered.length })}
            </div>
          </div>
        </header>

        <div className="mt-4 flex flex-col gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSearch(searchText.trim())
            }}
            className="flex w-full gap-2 lg:max-w-xl"
          >
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 shadow-sm outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <button type="submit" className="rounded-xl bg-slate-800 px-4 py-2.5 text-white">
              {common('search')}
            </button>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button type="button" onClick={() => setActiveSport('all')} className={tabClass(activeSport === 'all')}>
              {t('allSports')}
            </button>
            {data?.sports.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveSport(s)}
                className={tabClass(activeSport === s)}
              >
                {s}
                <span className="ml-1 text-xs opacity-70">{data.sport_counts[s] ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowLive((v) => !v)} className={tabClass(showLive)}>
              {t('live')}
            </button>
            <button
              type="button"
              onClick={() => setShowPopular((v) => !v)}
              className={tabClass(showPopular)}
            >
              {t('popular')}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-600 dark:text-slate-400">
            {common('loading')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('noEvents')}</h3>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => openEvent(e)}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {e.sport}
                  </span>
                  <div className="flex gap-1">
                    {e.is_live && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                        {t('live')}
                      </span>
                    )}
                    {e.popular && (
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        ★
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {e.title}
                </h3>

                {(e.home || e.away) && (
                  <div className="mt-2 flex items-center gap-2">
                    {e.home_badge ? (
                      <img src={e.home_badge} alt={e.home} className="h-6 w-6 rounded-full object-cover" />
                    ) : null}
                    <span className="text-xs text-slate-500 dark:text-slate-400">{e.home}</span>
                    <span className="text-xs text-slate-400">{t('vs')}</span>
                    {e.away_badge ? (
                      <img src={e.away_badge} alt={e.away} className="h-6 w-6 rounded-full object-cover" />
                    ) : null}
                    <span className="text-xs text-slate-500 dark:text-slate-400">{e.away}</span>
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-xs text-slate-400">{e.time}</span>
                  <span className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
                    {t('watchNow')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {selected.title}
                </h3>
                {selected.league ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selected.league}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                {t('close')}
              </button>
            </div>

            {selected.embeds.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selected.embeds.map((em, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveEmbed(i)}
                    className={tabClass(activeEmbed === i)}
                  >
                    {em.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-black">
              {selected.embeds[activeEmbed] && (
                <iframe
                  key={selected.embeds[activeEmbed].embed_url}
                  src={selected.embeds[activeEmbed].embed_url}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
