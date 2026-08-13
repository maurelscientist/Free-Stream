"use client"

import React, { useEffect, useMemo, useState } from 'react'
import ChannelCard from '../components/ChannelCard/ChannelCard'
import BackButton from '../components/BackButton'
import { CONTENT_CATEGORY_OPTIONS, REGION_OPTIONS, filterChannels } from '../lib/iptv/channelFilters'
import { Channel } from '../types'

const PAGE_SIZE = 48

export default function ChannelsPage() {
  const [allChannels, setAllChannels] = useState<Channel[]>([])
  const [query, setQuery] = useState('')
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [contentCategory, setContentCategory] = useState('Accueil')
  const [region, setRegion] = useState('Tous')

  useEffect(() => {
    setLoading(true)
    setError('')

    const params = new URLSearchParams({
      page: '1',
      pageSize: String(PAGE_SIZE * 4),
    })
    if (query) params.set('q', query)

    fetch(`/api/iptv/channels?${params.toString()}`)
      .then((res) => res.json())
      .then((d) => {
        const items = d.data || []
        setAllChannels(items)
        setTotal(items.length)
      })
      .catch(() => setError('Impossible de charger les chaînes.'))
      .finally(() => setLoading(false))
  }, [query])

  const filteredChannels = useMemo(() => {
    return filterChannels(allChannels, { contentCategory, region, query })
  }, [allChannels, contentCategory, query, region])

  const pagedChannels = useMemo(() => filteredChannels.slice(0, PAGE_SIZE * page), [filteredChannels, page])
  const hasMore = pagedChannels.length < filteredChannels.length

  useEffect(() => {
    setPage(1)
  }, [contentCategory, region, query])

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <header className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Free Stream</p>
            <h2 className="text-2xl font-semibold">Toutes les chaînes</h2>
          </div>
          <div className="text-sm text-slate-500">{filteredChannels.length} chaînes disponibles</div>
        </div>
      </header>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
          {CONTENT_CATEGORY_OPTIONS.map((category) => {
            const isActive = contentCategory === category
            return (
              <button
                key={category}
                type="button"
                onClick={() => setContentCategory(category)}
                className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setQuery(searchText.trim())
          }}
          className="flex w-full gap-2 lg:max-w-xl"
        >
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Rechercher une chaîne..."
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 shadow-sm outline-none focus:border-indigo-500"
          />
          <button type="submit" className="rounded-xl bg-slate-800 px-4 py-2.5 text-white">
            Rechercher
          </button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-500">Région</label>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {REGION_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <span className="font-medium text-slate-800">Filtre actuel :</span> {contentCategory} • {region}
      </div>

      {error && <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
      {loading && page === 1 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">Chargement des chaînes...</div>
      ) : filteredChannels.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
          <h3 className="text-lg font-semibold text-slate-800">Aucune chaîne disponible</h3>
          <p className="mt-2">Aucune chaîne ne correspond à cette catégorie et à cette sélection pour le moment.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {pagedChannels.map((c) => (
              <ChannelCard
                key={c.id}
                id={c.id}
                name={c.name}
                country={c.country}
                logo={c.logo}
                categories={c.categories}
                streams={c.streams}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Voir plus de chaînes'}
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </main>
  )
}
