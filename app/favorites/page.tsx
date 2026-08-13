"use client"
import React, { useEffect, useState } from 'react'
import ChannelCard from '../components/ChannelCard/ChannelCard'
import BackButton from '../components/BackButton'
import { supabase } from '../lib/supabaseClient'
import { getFavorites } from '../lib/favorites'

type Favorite = {
  id: string
  name: string
  country?: string
  logo?: string
  categories?: string[]
  streams?: Array<{ url: string }>
}

export default function FavoritesPage() {
  const [favs, setFavs] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadFavorites = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      if (!userId) {
        if (isMounted) {
          setMessage('Connectez-vous pour voir vos favoris.')
          setFavs([])
          setLoading(false)
        }
        return
      }

      const { data, error } = await getFavorites(userId)
      if (!isMounted) return

      if (error) {
        setMessage(error.message || 'Impossible de charger les favoris.')
        setFavs([])
      } else {
        const items = (data || []).map((item: any) => ({
          id: item.channel_id,
          name: item.channel_name,
          country: item.country || undefined,
          logo: item.logo || undefined,
          categories: item.categories || [],
          streams: item.streams || []
        }))
        setFavs(items)
        setMessage(items.length === 0 ? 'Aucune chaîne favorite.' : '')
      }
      setLoading(false)
    }

    loadFavorites()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        loadFavorites()
      } else {
        setFavs([])
        setMessage('Connectez-vous pour voir vos favoris.')
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <BackButton />
          <h2 className="text-2xl font-semibold">Favoris</h2>
          <div className="mt-6 p-6 bg-slate-50 rounded">Chargement des favoris…</div>
        </div>
      </main>
    )
  }

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <h2 className="text-2xl font-semibold">Favoris</h2>
      {message ? (
        <div className="mt-6 p-6 bg-slate-50 rounded">
          {message}
          {!favs.length && (
            <div className="mt-4"><a href="/channels" className="text-indigo-600">Explorer les chaînes</a></div>
          )}
        </div>
      ) : null}
      {favs.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {favs.map((c) => (
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
      )}
      </div>
    </main>
  )
}
