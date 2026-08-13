import React from 'react'
import ChannelCard from '../../components/ChannelCard/ChannelCard'
import BackButton from '../../components/BackButton'
import { fetchChannels } from '../../lib/iptv'
import { slugify } from '../../lib/utils/slugify'

function getFlagEmoji(code?: string) {
  if (!code || code.length !== 2) return '🌍'
  const normalized = code.toUpperCase()
  return String.fromCodePoint(...Array.from(normalized).map((char) => 127397 + char.charCodeAt(0)))
}

function getCountryFlagUrl(code?: string) {
  const normalized = String(code || '').trim().toLowerCase()
  if (!normalized) return null

  const aliases: Record<string, string> = {
    uk: 'gb',
    gb: 'gb',
    us: 'us',
    fr: 'fr',
    de: 'de',
    es: 'es',
    it: 'it',
    ca: 'ca',
    br: 'br',
    au: 'au',
    jp: 'jp',
    nl: 'nl',
    be: 'be',
    ch: 'ch',
    pt: 'pt',
    pl: 'pl',
    se: 'se',
    no: 'no',
    dk: 'dk',
    fi: 'fi',
    ie: 'ie',
    at: 'at',
    gr: 'gr',
    cz: 'cz',
    hu: 'hu',
    tr: 'tr',
    ru: 'ru',
    ua: 'ua',
    ar: 'ar',
    mx: 'mx',
    in: 'in',
    cn: 'cn',
    kr: 'kr',
    za: 'za',
    eg: 'eg',
    ma: 'ma',
    tn: 'tn',
  }

  const resolved = aliases[normalized] || normalized
  if (!/^[a-z]{2}$/.test(resolved)) return null

  return `https://flagcdn.com/w80/${resolved}.png`
}

function normalizeSlug(slug?: string) {
  return String(slug || '').trim().toLowerCase().replace(/-/g, ' ')
}

function getCountryCodeFromSlug(slug?: string) {
  const normalized = normalizeSlug(slug)
  const map: Record<string, string> = {
    france: 'fr',
    french: 'fr',
    'united states': 'us',
    'united states of america': 'us',
    america: 'us',
    'united kingdom': 'gb',
    'great britain': 'gb',
    britain: 'gb',
    england: 'gb',
    germany: 'de',
    spain: 'es',
    italy: 'it',
    canada: 'ca',
    brazil: 'br',
    australia: 'au',
    japan: 'jp',
    netherlands: 'nl',
    belgium: 'be',
    switzerland: 'ch',
    portugal: 'pt',
    poland: 'pl',
    sweden: 'se',
    norway: 'no',
    denmark: 'dk',
    finland: 'fi',
    ireland: 'ie',
    austria: 'at',
    greece: 'gr',
    'czech republic': 'cz',
    hungary: 'hu',
    turkey: 'tr',
    russia: 'ru',
    ukraine: 'ua',
    argentina: 'ar',
    mexico: 'mx',
    india: 'in',
    china: 'cn',
    korea: 'kr',
    'south korea': 'kr',
    'south africa': 'za',
    egypt: 'eg',
    morocco: 'ma',
    tunisia: 'tn',
  }

  if (/^[a-z]{2}$/.test(normalized)) return normalized
  return map[normalized] || ''
}

function getCountryLabel(slug: string | undefined, channels: any[]) {
  const normalizedSlug = slugify(String(slug || '')).toLowerCase()
  const exactChannel = channels.find((channel: any) => {
    const countryName = String(channel?.country || '')
    const countryCode = String(channel?.countryCode || '').toLowerCase()
    const countrySlug = slugify(countryName).toLowerCase()

    return countryCode === normalizedSlug || countrySlug === normalizedSlug
  })

  if (exactChannel?.country) return exactChannel.country

  const map: Record<string, string> = {
    fr: 'France',
    us: 'United States',
    gb: 'United Kingdom',
    de: 'Germany',
    es: 'Spain',
    it: 'Italy',
    ca: 'Canada',
    br: 'Brazil',
    au: 'Australia',
    jp: 'Japan',
    nl: 'Netherlands',
    be: 'Belgium',
    ch: 'Switzerland',
    pt: 'Portugal',
    pl: 'Poland',
    se: 'Sweden',
    no: 'Norway',
    dk: 'Denmark',
    fi: 'Finland',
    ie: 'Ireland',
    at: 'Austria',
    gr: 'Greece',
    cz: 'Czech Republic',
    hu: 'Hungary',
    tr: 'Türkiye',
    ru: 'Russia',
    ua: 'Ukraine',
    ar: 'Argentina',
    mx: 'Mexico',
    in: 'India',
    cn: 'China',
    kr: 'South Korea',
    za: 'South Africa',
    eg: 'Egypt',
    ma: 'Morocco',
    tn: 'Tunisia',
  }

  return map[normalizedSlug] || normalizedSlug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

async function getChannelsForCountry(slug: string) {
  const channels = await fetchChannels()
  const normalizedSlug = slugify(String(slug || '')).toLowerCase()

  return channels.filter((c: any) => {
    const countryName = String(c?.country || '')
    const countryCode = String(c?.countryCode || '').toLowerCase()
    const countrySlug = slugify(countryName).toLowerCase()

    return countryCode === normalizedSlug || countrySlug === normalizedSlug
  })
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const channels = await getChannelsForCountry(slug)
  const countryLabel = getCountryLabel(slug, channels)
  const rawCountryCode = channels.find((channel: any) => channel.countryCode)?.countryCode || getCountryCodeFromSlug(slug)
  const countryCode = String(rawCountryCode || '').toLowerCase()
  const countryFlagUrl = getCountryFlagUrl(countryCode)

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Pays</p>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex h-16 w-24 items-center justify-center overflow-hidden bg-white/10 p-0 shadow-inner">
                {countryFlagUrl ? (
                  <img
                    src={countryFlagUrl}
                    alt={`${countryLabel} drapeau`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">🌍</span>
                )}
              </div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{countryLabel}</h2>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-sm text-slate-300">Chaînes disponibles</p>
            <p className="text-2xl font-semibold">{channels.length}</p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {channels.map((c: any) => (
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
      </div>
    </main>
  )
}
