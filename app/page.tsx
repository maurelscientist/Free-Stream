"use client"

import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChannelCard from './components/ChannelCard/ChannelCard'
import ProfileMenu from './components/ProfileMenu'
import { Channel } from './types'

export default function Home() {
  const router = useRouter()
  const localeMap: Record<string, string> = {
    English: 'en',
    Français: 'fr',
    Español: 'es',
    Deutsch: 'de',
    العربية: 'ar'
  }

  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('English')
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')

    fetch('/api/iptv/channels?page=1&pageSize=200')
      .then((res) => res.json())
      .then((data) => {
        const allChannels = data.data || []
        const shuffled = [...allChannels].sort(() => Math.random() - 0.5)
        setChannels(shuffled.slice(0, 16))
      })
      .catch(() => setError('Impossible de charger les chaînes.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="flex min-h-screen flex-col pt-4 pb-8">
      <div className="mx-auto flex-1 w-full max-w-7xl px-4 flex flex-col">
      <header className="relative flex items-center justify-between gap-4 py-4">
        <Link href="/">
          <img src="/logo.png" alt="Free Stream" className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden space-x-4 md:flex">
            <Link href="/channels" className="text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-200 dark:hover:text-white">Chaînes</Link>
            <Link href="/countries" className="text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-200 dark:hover:text-white">Pays</Link>
            <Link href="/categories" className="text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-200 dark:hover:text-white">Catégories</Link>
            <Link href="/favorites" className="text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-200 dark:hover:text-white">Favoris</Link>
            <Link href="/sports" className="relative text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-200 dark:hover:text-white">
              Sports
              <span className="absolute -right-2 -top-1 h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label="Menu"
            aria-expanded={mobileNavOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 md:hidden dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <i className="bi bi-list text-2xl leading-none" aria-hidden="true" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              <span>{language.slice(0, 2).toUpperCase()}</span>
              <span className="text-slate-400">▾</span>
            </button>
            {languageMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl">
                {['English', 'Français', 'Español', 'Deutsch', 'العربية'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setLanguage(lang)
                      setLanguageMenuOpen(false)
                      const locale = localeMap[lang] ?? 'en'
                      router.push(`/${locale}`)
                    }}
                    className={`w-full px-4 py-3 text-left text-sm ${language === lang ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ProfileMenu />
        </div>

        {mobileNavOpen && (
          <div className="absolute inset-x-0 top-full z-40 mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg md:hidden dark:border-slate-700 dark:bg-slate-800">
            <Link href="/channels" onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">Chaînes</Link>
            <Link href="/countries" onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">Pays</Link>
            <Link href="/categories" onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">Catégories</Link>
            <Link href="/favorites" onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">Favoris</Link>
            <Link href="/sports" onClick={() => setMobileNavOpen(false)} className="relative block rounded-lg px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">
              Sports
              <span className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-red-500" aria-hidden="true" />
            </Link>
          </div>
        )}
      </header>

      <section className="mt-6 md:mt-8">
        <div className="rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 p-6 text-white md:p-8">
          <h2 className="text-2xl font-bold md:text-3xl">Regardez vos chaînes préférées en direct</h2>
          <p className="mt-2 text-sm md:text-base">Découvrez des chaînes TV disponibles en ligne, classées par pays, langue et catégorie.</p>
          <div className="mt-3 flex space-x-3 md:mt-4">
            <Link href="/channels" className="rounded bg-white px-3 py-1.5 text-sm text-indigo-700 md:px-4 md:py-2 md:text-base">Explorer les chaînes</Link>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Chaînes en direct</h3>
          <Link href="/channels" className="text-sm text-indigo-600 hover:underline">Voir toutes</Link>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Chargement des chaînes populaires…</p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {channels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  id={channel.id}
                  name={channel.name}
                  country={channel.country}
                  logo={channel.logo}
                  categories={channel.categories}
                  streams={channel.streams}
                />
              ))}
            </div>
          </>
        )}
      </section>

      </div>

      <footer className="mt-10 w-full border-t border-sky-500 bg-sky-700 text-white py-10">
        <div className="mx-auto w-full max-w-7xl px-4 space-y-8 text-sm">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="font-semibold">Navigation</p>
              <div className="space-y-1 text-slate-100">
                <Link href="/" className="hover:text-sky-200 hover:underline">Accueil</Link>
                <span>·</span>
                <Link href="/channels" className="hover:text-sky-200 hover:underline">Chaînes</Link>
                <span>·</span>
                <Link href="/categories" className="hover:text-sky-200 hover:underline">Catégories</Link>
                <span>·</span>
                <Link href="/legal" className="hover:text-sky-200 hover:underline">Mentions légales</Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Informations</p>
              <div className="space-y-1 text-slate-100">
                <Link href="/privacy" className="hover:text-sky-200 hover:underline">Politique de confidentialité</Link>
                <span>·</span>
                <Link href="/cookies" className="hover:text-sky-200 hover:underline">Politique de cookies</Link>
                <span>·</span>
                <Link href="/report" className="hover:text-sky-200 hover:underline">Signaler un contenu</Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Support</p>
              <div className="space-y-1 text-slate-100">
                <Link href="/favorites" className="hover:text-sky-200 hover:underline">Favoris</Link>
                <span>·</span>
                <Link href="/channels" className="hover:text-sky-200 hover:underline">Toutes les chaînes</Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Copyright</p>
              <p>© 2026 Free Stream — Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
