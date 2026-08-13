"use client"
import React, { useEffect, useState } from 'react'
import ChannelCard from '../components/ChannelCard/ChannelCard'
import BackButton from '../components/BackButton'

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fs:history')
      setHistory(raw ? JSON.parse(raw) : [])
    } catch (e) {
      setHistory([])
    }
  }, [])

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <h2 className="text-2xl font-semibold">Récemment regardées</h2>
      {history.length === 0 ? (
        <div className="mt-6 p-6 bg-slate-50 rounded">Aucune chaîne récemment regardée</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {history.map((h) => (
            <ChannelCard
            key={h.id}
            id={h.id}
            name={h.name}
            country={h.country}
            logo={h.logo}
            categories={h.categories}
            streams={h.streams}
          />
          ))}
        </div>
      )}
      </div>
    </main>
  )
}
