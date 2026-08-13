"use client"
import React, { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { getFavorites, removeFavorite, saveFavorite } from '../../lib/favorites'
import { getCountryName, getCategoryName } from '../../lib/utils/country'
import { FALLBACK_COUNTRY } from '../../../lib/iptv/countryDetect'
import { supabase } from '../../lib/supabaseClient'

type Stream = {
  url: string
}

type Props = {
  id: string
  name: string
  country?: string
  logo?: string
  categories?: string[]
  streams?: Stream[]
}

type Favorite = {
  id: string
  name: string
  country?: string
  logo?: string
  categories?: string[]
  streams?: Stream[]
}

export default function ChannelCard({ id, name, country, logo, categories, streams }: Props) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('common')
  const common = t
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [imageError, setImageError] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const hasStreams = Array.isArray(streams) && streams.some((stream) => typeof stream?.url === 'string' && stream.url.trim() !== '')

  const isFav = favorites.some((f: Favorite) => f.id === id)

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id || null)
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) {
      setFavorites([])
      return
    }

    getFavorites(userId).then(({ data }) => {
      const items = (data || []).map((item: any) => ({ id: item.channel_id, name: item.channel_name, country: item.country || undefined, logo: item.logo || undefined, categories: item.categories || [], streams: item.streams || [] }))
      setFavorites(items)
    })
  }, [userId])

  async function toggleFav(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (!userId) {
      setMessage(common('loginRequired'))
      return
    }

    if (isFav) {
      const { error } = await removeFavorite(id, userId)
      if (!error) {
        setFavorites(favorites.filter((f: Favorite) => f.id !== id))
      }
      setMessage(error ? error.message : common('removedFromFavorites'))
    } else {
      const { error } = await saveFavorite({ id, name, country, logo, categories, streams }, userId)
      if (!error) {
        setFavorites([...favorites, { id, name, logo, country, categories, streams }])
      }
      setMessage(error ? error.message : common('addedToFavorites'))
    }
  }

  function openChannel(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('button')) return
    router.push(`/${locale}/watch/${encodeURIComponent(id)}`)
  }

  return (
    <article onClick={openChannel} className="relative cursor-pointer border rounded-lg p-4 hover:shadow-lg transition-shadow dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-slate-900/50">
      
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-white border border-slate-200 rounded overflow-hidden flex items-center justify-center shadow-sm dark:bg-slate-700 dark:border-slate-600">
          {logo && !imageError ? (
            <img
              src={logo}
              alt={`${name} logo`}
              className="object-contain w-full h-full p-1"
              onError={() => setImageError(true)}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">{name.slice(0, 2)}</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{name}</h4>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{getCountryName(country || FALLBACK_COUNTRY, locale)} • {categories?.[0] ? getCategoryName(categories[0], locale) : '—'}</div>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <button
          type="button"
          className="text-indigo-600 dark:text-indigo-400"
          onClick={(event) => {
            event.stopPropagation()
            router.push(`/${locale}/watch/${encodeURIComponent(id)}`)
          }}
        >
          ▶ {t('watch')}
        </button>
        <button type="button" aria-pressed={isFav} onClick={toggleFav} aria-label={isFav ? t('removeFromFavorites') : t('addToFavorites')}>
          {isFav ? '♥' : '♡'}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{message}</p> : null}
    </article>
  )
}
