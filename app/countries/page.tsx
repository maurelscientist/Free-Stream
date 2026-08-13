"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import BackButton from '../components/BackButton'
import { slugify } from '../lib/utils/slugify'
import { getCountryFlagUrl } from '../lib/utils/country'

function getCountryDisplayName(name: string, code?: string) {
  if (!name) return 'Inconnu'

  const trimmed = name.trim()
  const codeCandidate = String(code || trimmed).trim().toUpperCase()
  if (/^[A-Z]{2}$/.test(codeCandidate)) {
    try {
      return new Intl.DisplayNames(['fr'], { type: 'region' }).of(codeCandidate) || trimmed
    } catch {
      return trimmed
    }
  }

  return trimmed
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/iptv/channels')
      .then((r) => r.json())
      .then((d) => {
        const list = d.data || []
        const map: Record<string, { code?: string; name: string; count: number }> = {}
        list.forEach((c: any) => {
          const key = c.country || c.countryCode || 'Unknown'
          if (!map[key]) map[key] = { code: c.countryCode, name: c.country || c.countryCode || 'Unknown', count: 0 }
          map[key].count += 1
        })
        const arr = Object.keys(map).map((k) => ({ key: k, ...map[k] }))
        setCountries(arr.sort((a, b) => b.count - a.count))
      })
  }, [])

  const normalizedSearch = search.trim().toLowerCase()
  const filteredCountries = normalizedSearch
    ? countries.filter((c) => {
        const countryName = c.name.toLowerCase()
        const countryCode = String(c.code || '').toLowerCase()
        return countryName.includes(normalizedSearch) || countryCode.includes(normalizedSearch)
      })
    : countries

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pays</h2>
          <p className="mt-1 text-sm text-slate-500">Recherchez un pays par nom ou code.</p>
        </div>
        <div className="w-full sm:w-72">
          <label htmlFor="country-search" className="sr-only">
            Recherche de pays
          </label>
          <input
            id="country-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un pays..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredCountries.length > 0 ? (
          filteredCountries.map((c) => {
            const displayName = getCountryDisplayName(c.name, c.code)
            const flagUrl = getCountryFlagUrl(c.code || c.name)
            return (
              <Link key={c.key} href={`/country/${slugify(c.name)}`} className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-20 items-center justify-center overflow-hidden bg-slate-100">
                    {flagUrl ? (
                      <img src={flagUrl} alt={`${displayName} drapeau`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xl">🌍</span>
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900 leading-tight">{displayName}</div>
                    <div className="text-sm text-slate-500">{c.count} chaînes</div>
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-500">
            Aucun pays trouvé pour « {search} »
          </div>
        )}
      </div>
      </div>
    </main>
  )
}
