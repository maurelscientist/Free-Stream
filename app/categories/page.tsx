"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import BackButton from '../components/BackButton'
import { slugify } from '../lib/utils/slugify'

export default function CategoriesPage() {
  const [cats, setCats] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/iptv/channels')
      .then((r) => r.json())
      .then((d) => {
        const list = d.data || []
        const map: Record<string, number> = {}
        list.forEach((c: any) => {
          ;(c.categories || []).forEach((cat: string) => {
            map[cat] = (map[cat] || 0) + 1
          })
        })
        const arr = Object.keys(map).map((k) => ({ name: k, count: map[k] }))
        setCats(arr.sort((a, b) => b.count - a.count))
      })
  }, [])

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <h2 className="text-2xl font-semibold">Catégories</h2>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cats.map((c) => (
            <Link key={c.name} href={`/categories/${slugify(c.name)}`} className="p-4 border rounded hover:bg-slate-50">
              <div className="text-lg">{c.name}</div>
              <div className="text-sm text-slate-500">{c.count} chaînes</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
