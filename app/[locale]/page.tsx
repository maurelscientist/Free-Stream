"use client"

import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ChannelCard from './components/ChannelCard/ChannelCard'
import ProfileMenu from './components/ProfileMenu'
import { Channel } from './types'

export default function Home() {
  const t = useTranslations('home')
  const common = useTranslations('common')
  const locale = useLocale()
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')

    fetch(`/api/iptv/channels?page=1&pageSize=200`)
      .then((res) => res.json())
      .then((data) => {
        const allChannels = data.data || []
        const shuffled = [...allChannels].sort(() => Math.random() - 0.5)
        setChannels(shuffled.slice(0, 16))
      })
      .catch(() => setError(common('error')))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="flex min-h-screen flex-col pt-4 pb-8">
      <div className="mx-auto flex-1 w-full max-w-7xl px-4 flex flex-col">
      <header className="relative flex items-center justify-between gap-4 py-4">
        <Link href={`/${locale}`}>
          <img src="/logo.png" alt="Free Stream" className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden space-x-4 md:flex">
            <Link href={`/${locale}/channels`} className="text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-200 dark:hover:text-white">{common('channels')}</Link>
            <Link href={`/${locale}/countries`} className="text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-200 dark:hover:text-white">{common('countries')}</Link>
            <Link href={`/${locale}/categories`} className="text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-200 dark:hover:text-white">{common('categories')}</Link>
            <Link href={`/${locale}/favorites`} className="text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-200 dark:hover:text-white">{common('favorites')}</Link>
            <Link href={`/${locale}/sports`} className="relative text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-200 dark:hover:text-white">
              {common('sports')}
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

          <ProfileMenu />
        </div>

        {mobileNavOpen && (
          <div className="absolute inset-x-0 top-full z-40 mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg md:hidden dark:border-slate-700 dark:bg-slate-800">
            <Link href={`/${locale}/channels`} onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">{common('channels')}</Link>
            <Link href={`/${locale}/countries`} onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">{common('countries')}</Link>
            <Link href={`/${locale}/categories`} onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">{common('categories')}</Link>
            <Link href={`/${locale}/favorites`} onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">{common('favorites')}</Link>
            <Link href={`/${locale}/sports`} onClick={() => setMobileNavOpen(false)} className="relative block rounded-lg px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">
              {common('sports')}
              <span className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-red-500" aria-hidden="true" />
            </Link>
          </div>
        )}
      </header>

      <section className="mt-6 md:mt-8">
        <div className="rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 p-6 text-white md:p-8">
          <h2 className="text-2xl font-bold md:text-3xl">{t('heroTitle')}</h2>
          <p className="mt-2 text-sm md:text-base">{t('heroDescription')}</p>
          <div className="mt-3 flex space-x-3 md:mt-4">
            <Link href={`/${locale}/channels`} className="rounded bg-white px-3 py-1.5 text-sm text-indigo-700 md:px-4 md:py-2 md:text-base">{t('exploreChannels')}</Link>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{t('liveChannels')}</h3>
          <Link href={`/${locale}/channels`} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">{t('viewAll')}</Link>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">{common('loading')}</p>
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
              <p className="font-semibold">{common('channels')}</p>
              <div className="space-y-1 text-slate-100">
                <Link href={`/${locale}`} className="hover:text-sky-200 hover:underline">{common('home')}</Link>
                <span>·</span>
                <Link href={`/${locale}/channels`} className="hover:text-sky-200 hover:underline">{common('channels')}</Link>
                <span>·</span>
                <Link href={`/${locale}/categories`} className="hover:text-sky-200 hover:underline">{common('categories')}</Link>
                <span>·</span>
                <Link href={`/${locale}/legal`} className="hover:text-sky-200 hover:underline">{common('legal')}</Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">{common('settings')}</p>
              <div className="space-y-1 text-slate-100">
                <Link href={`/${locale}/privacy`} className="hover:text-sky-200 hover:underline">{common('privacy')}</Link>
                <span>·</span>
                <Link href={`/${locale}/cookies`} className="hover:text-sky-200 hover:underline">{common('cookies')}</Link>
                <span>·</span>
                <Link href={`/${locale}/report`} className="hover:text-sky-200 hover:underline">{common('report')}</Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">{common('support')}</p>
              <div className="space-y-1 text-slate-100">
                <Link href={`/${locale}/favorites`} className="hover:text-sky-200 hover:underline">{common('favorites')}</Link>
                <span>·</span>
                <Link href={`/${locale}/channels`} className="hover:text-sky-200 hover:underline">{common('channels')}</Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">{common('copyright')}</p>
              <p>© 2026 Free Stream — {common('rightsReserved')}</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
