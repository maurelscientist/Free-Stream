"use client"

import React, { useEffect, useState } from 'react'
import ChannelCard from '../components/ChannelCard/ChannelCard'
import BackButton from '../components/BackButton'
import { Channel } from '../types'

const PAGE_SIZE = 48

export default function LivePage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')

    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    })

    fetch(`/api/iptv/channels?${params.toString()}`)
      .then((res) => res.json())
      .then((d) => {
        const items = d.data || []
        setChannels((prev) => (page === 1 ? items : [...prev, ...items]))
        setTotal(d.total ?? 0)
      })
      .catch(() => setError('Impossible de charger les chaînes.'))
      .finally(() => setLoading(false))
  }, [page])

  const hasMore = channels.length < total

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <h2 className="text-2xl font-semibold">Direct</h2>
      <p className="mt-2 text-slate-500">Les flux disponibles en direct depuis l'API.</p>

      {error && <div className="mt-6 p-4 bg-red-50 text-red-700 rounded">{error}</div>}

      {loading && page === 1 ? (
        <div className="mt-6">Chargement des chaînes...</div>
      ) : (
        <>
          <div className="mt-6 text-sm text-slate-500">Affichage {channels.length} sur {total || '...'}</div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {channels.map((c) => (
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
                className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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
