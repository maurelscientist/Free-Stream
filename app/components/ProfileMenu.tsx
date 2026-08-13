"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '../lib/supabaseClient'

type SessionUser = {
  id: string
  email?: string | null
  avatarUrl?: string | null
  name?: string | null
}

export default function ProfileMenu() {
  const pathname = usePathname()
  let common = (k: string) => k
  let languages = (k: string) => k
  try {
    // useTranslations may throw during certain prerender steps if provider isn't mounted
    // so we fallback gracefully to identity functions.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    common = useTranslations('common')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    languages = useTranslations('languages')
  } catch (e) {
    // fallback: identity functions already set
  }
  const LANG_CODES = ['en', 'fr', 'es', 'de', 'ar']
  const LANGS = LANG_CODES.map((code) => ({ code, label: languages(code) }))

  const currentLocale = pathname?.match(/^\/(en|fr|es|de|ar)/)?.[1] ?? 'fr'

  function pathForLocale(lang: string) {
    try {
      if (!pathname) return `/${lang}`
      const rest = pathname.replace(/^\/(en|fr|es|de|ar)/, '') || ''
      if (rest === '' || rest === '/') return `/${lang}`
      return `/${lang}${rest}`
    } catch {
      return `/${lang}`
    }
  }

  const [user, setUser] = useState<SessionUser | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  useEffect(() => {
    const extract = (session: any) => {
      const u = session?.user
      if (!u) return null
      const meta = u.user_metadata || {}
      const identities = u.identities || []
      let avatarUrl: string | null = meta.avatar_url || meta.picture || null
      if (!avatarUrl) {
        for (const id of identities) {
          const d = id?.identity_data || {}
          if (d.avatar_url || d.picture) {
            avatarUrl = d.avatar_url || d.picture
            break
          }
        }
      }
      return {
        id: u.id,
        email: u.email,
        avatarUrl,
        name: meta.full_name || meta.name || null,
      }
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(extract(session))
      setAvatarError(false)
    })
    // Populate immediately for an already-established session.
    supabase.auth.getSession().then(({ data }) => setUser(extract(data.session)))

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    if (mode === 'sign-up') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }
      setMessage(common('accountCreated'))
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }
      setMessage(common('loginSuccess'))
    }

    setEmail('')
    setPassword('')
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setMessage(common('logoutSuccess'))
  }

  return (
    <div className="relative flex items-center gap-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setLanguageMenuOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-900"
        >
          <span className="uppercase">{currentLocale}</span>
          <span className="text-slate-400">▾</span>
        </button>

        {languageMenuOpen ? (
          <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl">
            {LANGS.map((l) => (
              <Link
                key={l.code}
                href={pathForLocale(l.code)}
                onClick={() => setLanguageMenuOpen(false)}
                className="block w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                {l.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {user ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-indigo-700 font-medium hover:bg-indigo-200 focus:outline-none"
            aria-label="Profil utilisateur"
          >
            {user.avatarUrl && !avatarError ? (
              <img
                src={user.avatarUrl}
                alt={user.name || user.email || 'avatar'}
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : user.email ? (
              user.email.charAt(0).toUpperCase()
            ) : (
              'U'
            )}
          </button>
          {isOpen ? (
            <div className="absolute right-0 top-full mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
              <div className="text-sm">
                <div className="font-medium text-slate-800">{user.email}</div>
                <button type="button" onClick={handleSignOut} className="mt-2 text-indigo-600 hover:underline">
                  {common('logout')}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <button type="button" onClick={() => setIsOpen((prev) => !prev)} className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-slate-700 hover:text-slate-900 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
              <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
            </svg>
          </button>
          {isOpen ? (
            <div className="absolute right-0 top-full mt-2 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg md:min-w-[280px] z-10">
              <div className="flex gap-2">
                <button type="button" onClick={() => setMode('sign-in')} className={`rounded-full px-3 py-1 text-sm ${mode === 'sign-in' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {common('login')}
                </button>
                <button type="button" onClick={() => setMode('sign-up')} className={`rounded-full px-3 py-1 text-sm ${mode === 'sign-up' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {common('register')}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={common('email')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={common('password')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <button type="submit" disabled={loading} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white">
                  {loading ? common('loading') : mode === 'sign-in' ? common('login') : common('register')}
                </button>
              </form>

              {message ? <p className="text-xs text-slate-600">{message}</p> : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}