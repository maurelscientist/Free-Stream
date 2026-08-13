export const CONTENT_CATEGORY_OPTIONS = [
  'Accueil',
  'Infos',
  'Sport',
  'Football',
  'Jeunesse',
  'Divertissement',
  'Films & Séries',
  'Documentaires',
  'Musique',
  'Culture',
  'Éducation',
  'Science & Technologie',
  'Économie',
  'Politique',
  'Lifestyle',
  'Cuisine',
  'Voyage',
  'Nature',
  'Météo',
  'Religieux',
  'Automobile',
  'Mode',
  'Gaming',
  'International'
]

export const REGION_OPTIONS = [
  'Tous',
  'Afrique',
  'France',
  'États-Unis',
  'Royaume-Uni',
  'Amérique latine',
  'Asie',
  'Moyen-Orient',
  'Océanie',
  'International',
  'Autres'
]

import { slugify } from '../utils/slugify'

export function categoryKey(label: string) {
  return slugify(label)
}

export function regionKey(label: string) {
  return slugify(label)
}

export interface ChannelFilterState {
  contentCategory: string
  region: string
  query: string
}

function normalizeValue(value: string | undefined | null) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

const CONTENT_CATEGORY_ALIASES: Record<string, string[]> = {
  Accueil: [],
  Infos: ['news', 'info', 'infos', 'journal', 'current', 'actualité', 'actualite'],
  Sport: ['sport', 'sports', 'athletic', 'fitness', 'tennis', 'basketball', 'volleyball', 'formula', 'motor'],
  Football: ['football', 'soccer'],
  Jeunesse: ['kids', 'children', 'youth', 'family', 'cartoon', 'animation', 'teen'],
  Divertissement: ['entertainment', 'variety', 'talk', 'reality', 'comedy', 'show', 'showtime'],
  'Films & Séries': ['movie', 'movies', 'series', 'serie', 'drama', 'soap', 'cinema', 'animation'],
  Documentaires: ['documentary', 'documentaries', 'doc', 'docu'],
  Musique: ['music', 'musical', 'concert'],
  Culture: ['culture', 'arts', 'art', 'heritage'],
  Éducation: ['education', 'educational', 'learn', 'learning', 'school'],
  'Science & Technologie': ['science', 'tech', 'technology', 'digital', 'innovation'],
  Économie: ['business', 'finance', 'economy', 'market', 'economics'],
  Politique: ['politics', 'political', 'policy', 'public affairs'],
  Lifestyle: ['lifestyle', 'health', 'fashion', 'beauty', 'wellness'],
  Cuisine: ['cooking', 'food', 'cuisine', 'cook'],
  Voyage: ['travel', 'tourism', 'voyage'],
  Nature: ['nature', 'outdoor', 'wildlife', 'animals'],
  Météo: ['weather', 'meteorology', 'meteo'],
  Religieux: ['religious', 'religion', 'faith', 'christian', 'islam', 'church'],
  Automobile: ['automobile', 'auto', 'car', 'cars', 'motor', 'motorsport'],
  Mode: ['fashion', 'style', 'beauty', 'mode'],
  Gaming: ['gaming', 'game', 'games', 'esports', 'gaming']
}

const REGION_ALIASES: Record<string, string[]> = {
  Afrique: ['dz', 'ao', 'bj', 'bw', 'bf', 'bi', 'cv', 'cm', 'cf', 'td', 'km', 'cg', 'cd', 'ci', 'dj', 'eg', 'gq', 'er', 'et', 'ga', 'gm', 'gh', 'gn', 'gw', 'ke', 'ls', 'lr', 'ly', 'mg', 'mw', 'ml', 'mr', 'mu', 'ma', 'mz', 'na', 'ne', 'ng', 'rw', 'st', 'sn', 'sc', 'sl', 'so', 'za', 'ss', 'sd', 'sz', 'tz', 'tg', 'tn', 'ug', 'zm', 'zw', 'africa', 'african'],
  France: ['fr', 'france', 'french'],
  'États-Unis': ['us', 'usa', 'united states', 'american'],
  'Royaume-Uni': ['gb', 'uk', 'united kingdom', 'british', 'england', 'scotland', 'wales', 'ireland'],
  'Amérique latine': ['ar', 'bo', 'br', 'cl', 'co', 'cr', 'cu', 'do', 'ec', 'sv', 'gt', 'hn', 'mx', 'ni', 'pa', 'py', 'pe', 'pr', 'uy', 've', 'latin', 'latam', 'hispanic'],
  Asie: ['cn', 'jp', 'kr', 'in', 'id', 'pk', 'bd', 'vn', 'ph', 'my', 'th', 'sg', 'hk', 'tw', 'kz', 'uz', 'tj', 'tm', 'kg', 'mn', 'asia', 'asian'],
  'Moyen-Orient': ['ae', 'bh', 'il', 'iq', 'jo', 'kw', 'lb', 'om', 'qa', 'sa', 'sy', 'tr', 'ye', 'middle east', 'arab'],
  Océanie: ['au', 'nz', 'fj', 'pg', 'sb', 'vu', 'ki', 'to', 'ws', 'tv', 'oceania', 'pacific'],
  International: ['international', 'world', 'global'],
  Autres: []
}

function matchesContentCategory(channel: any, contentCategory: string) {
  if (!contentCategory || contentCategory === 'Accueil') return true

  const aliases = CONTENT_CATEGORY_ALIASES[contentCategory] || []
  if (aliases.length === 0) return true

  const haystacks = [
    ...(channel.categories || []),
    channel.country,
    channel.countryCode,
    channel.name,
    ...(channel.languages || []),
    ...(channel.categories || []).join(' ')
  ]

  return haystacks.some((value) => {
    const normalized = normalizeValue(value)
    return aliases.some((alias) => normalized.includes(alias))
  })
}

function matchesRegion(channel: any, region: string): boolean {
  if (!region || region === 'Tous') return true

  if (region === 'Autres') {
    return !Object.keys(REGION_ALIASES)
      .filter((key) => key !== 'Autres')
      .some((key) => matchesRegion(channel, key))
  }

  const aliases = REGION_ALIASES[region] || []
  const haystacks = [channel.countryCode, channel.country, channel.name, ...(channel.languages || [])]

  return haystacks.some((value) => {
    const normalized = normalizeValue(value)
    return aliases.some((alias) => normalized.includes(alias))
  })
}

function matchesQuery(channel: any, query: string) {
  if (!query) return true

  const normalizedQuery = normalizeValue(query)
  const haystacks = [
    channel.name,
    channel.country,
    channel.countryCode,
    ...(channel.categories || []),
    ...(channel.languages || [])
  ]

  return haystacks.some((value) => normalizeValue(value).includes(normalizedQuery))
}

export function filterChannels(channels: any[], filter: ChannelFilterState) {
  return channels.filter((channel) => {
    return matchesContentCategory(channel, filter.contentCategory) && matchesRegion(channel, filter.region) && matchesQuery(channel, filter.query)
  })
}
