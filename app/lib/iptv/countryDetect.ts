// Best-effort country inference for aggregated IPTV channels.
//
// Many M3U sources omit the `country`/`countryCode` attribute, which makes the
// UI fall back to "Inconnu" / "Unknown". This module derives an ISO 3166-1
// alpha-2 country code from whatever signals are available, in priority order:
//   1. an existing valid country/countryCode
//   2. the TLD-like suffix in the channel id / epgId (e.g. `Name.ua@SD` -> ua)
//   3. the stream URL host (TLD or known ccSLD)
//   4. the group/category title
//   5. the detected language -> a representative country
//   6. country keywords found in the channel name
//
// It intentionally never invents a country when no signal exists; it simply
// returns null so the caller can decide how to handle the gap.

import { normalizeCountryCode } from '../utils/country'

// 2-letter TLDs that are commonly used generically and therefore are NOT
// reliable country signals.
const GENERIC_TLDS = new Set([
  'com', 'net', 'org', 'info', 'biz', 'tv', 'gg', 'sh', 'to', 'me', 'ly', 'fm',
  'am', 'io', 'co', 'ws', 'cc', 'gl', 'nu', 'tk', 'ml', 'ga', 'cf', 'xyz',
  'live', 'online', 'site', 'fun', 'press', 'cloud', 'app', 'dev', 'page',
  'top', 'vip', 'work', 'store', 'tech', 'space', 'website', 'blog',
])

// Language code -> representative country code.
const LANGUAGE_TO_COUNTRY: Record<string, string> = {
  fr: 'fr', en: 'gb', es: 'es', ar: 'sa', de: 'de', it: 'it', pt: 'pt',
  ru: 'ru', zh: 'cn', tr: 'tr', ja: 'jp', ko: 'kr', nl: 'nl', pl: 'pl',
  sv: 'se', no: 'no', da: 'dk', fi: 'fi', cs: 'cz', hu: 'hu', ro: 'ro',
  el: 'gr', th: 'th', vi: 'vn', id: 'id', ms: 'my', hi: 'in', fa: 'ir',
  he: 'il', uk: 'ua', bg: 'bg', hr: 'hr', sr: 'rs', sk: 'sk', sl: 'si',
  et: 'ee', lv: 'lv', lt: 'lt', ca: 'ca', eu: 'es',
}

// Known streaming/CDN platform host suffixes -> country code. Many IPTV
// streams are served from generic `.com` CDNs (Amagi, Alibaba, Tencent, ...)
// that carry no country TLD, so we map the well-known hosts explicitly.
const HOST_TO_COUNTRY: [string, string][] = [
  // China
  ['qcloudcdn.com', 'cn'], ['myqcloud.com', 'cn'], ['alicdn.com', 'cn'],
  ['taobao.com', 'cn'], ['yy.com', 'cn'], ['bdstatic.com', 'cn'],
  ['lecloud.com', 'cn'], ['zjrtv.vip', 'cn'], ['qingting.fm', 'cn'],
  ['21dtv.com', 'cn'], ['xmcdn.com', 'cn'], ['faiusr.com', 'cn'],
  ['wscdns.com', 'cn'], ['sofast.tv', 'cn'], ['baidu.com', 'cn'],
  ['myalicdn.com', 'cn'], ['qianqian.com', 'cn'], ['sctv.com', 'cn'],
  ['huya.com', 'cn'], ['cztv.com', 'cn'], ['letv.com', 'cn'],
  ['iqilu.com', 'cn'], ['wasu.tv', 'cn'], ['hkdtmb.com', 'cn'],
  // Bangladesh
  ['jagobd.com', 'bd'],
  // Russia
  ['ngenix.net', 'ru'],
  // Vietnam
  ['fptplay.net', 'vn'],
  // United States
  ['ottera.tv', 'us'], ['tubi.io', 'us'], ['tubi.video', 'us'],
  ['klowdtv.com', 'us'], ['amagi.tv', 'us'], ['wurl.com', 'us'],
  ['nbcuni.com', 'us'], ['frequency.stream', 'us'], ['rakuten.tv', 'us'],
  // Canada
  ['stingray.com', 'ca'],
]

// First octets that are overwhelmingly allocated to Chinese operators. Used as
// a last-resort signal for IP-based streams that carry no other country hint.
const CHINA_IP_FIRST_OCTETS = new Set([
  36, 39, 42, 49, 58, 59, 60, 61, 101, 103, 111, 112, 113, 114, 115, 116,
  117, 118, 119, 120, 121, 122, 123, 124, 125, 134, 136, 137, 138, 139, 140,
  144, 149, 150, 153, 157, 158, 159, 171, 172, 175, 178, 180, 182, 183, 202,
  203, 210, 211, 218, 219, 220, 221, 222, 223, 129,
])

// Country name / keyword -> code. Covers group titles and channel names.
// Stems are used (not strict word boundaries) so variants like "Mexicana"
// still match "mexic", "Español" matches "españ", etc.
const COUNTRY_KEYWORDS: [RegExp, string][] = [
  [/\b(franc|france|french|tf1|\bm6\b|fr2|fr3|fr24)\b/i, 'fr'],
  [/\b(united kingdom|\buk\b|british|bbc|\bitv\b|channel\s*4|sky\s*uk|england)\b/i, 'gb'],
  [/\b(usa|united states|america|american|\babc\b|\bnbc\b|\bcbs\b|\bfox\b|\bpbs\b|hollywood)\b/i, 'us'],
  [/\b(españ|espan|spanish|espagnol|iberia)\b/i, 'es'],
  [/\b(deutsch|german|germany|\bard\b|\bzdf\b|das erste)\b/i, 'de'],
  [/\b(ital|rai|mediaset|la7)\b/i, 'it'],
  [/\b(portug|portugal)\b/i, 'pt'],
  [/\b(russ|rossiya|перший)\b/i, 'ru'],
  [/\b(ukrain|україн)\b/i, 'ua'],
  [/\b(nederland|dutch|netherlands|\bnos\b|rtl\s*nl)\b/i, 'nl'],
  [/\b(belg|vrt|rtbf)\b/i, 'be'],
  [/\b(schweiz|swiss|switzerland|suisse|\brts\b|\bssr\b)\b/i, 'ch'],
  [/\b(canad)\b/i, 'ca'],
  [/\b(mexic)\b/i, 'mx'],
  [/\b(brazil|brasil|brazili|globo|record\s*tv|\bsbt\b)\b/i, 'br'],
  [/\b(greec|greek|ellada|\bert\b|hellenic)\b/i, 'gr'],
  [/\b(turk|türk|turkey|turquie|trt)\b/i, 'tr'],
  [/\b(polish|polska|pologne|poland)\b/i, 'pl'],
  [/\b(swed|svt)\b/i, 'se'],
  [/\b(norw|nrk)\b/i, 'no'],
  [/\b(danish|denmark|\bdr\s*tv\b)\b/i, 'dk'],
  [/\b(finn|yle)\b/i, 'fi'],
  [/\b(austr|orf)\b/i, 'at'],
  [/\b(irish|ireland|rte)\b/i, 'ie'],
  [/\b(saudi|arabie saoudite)\b/i, 'sa'],
  [/\b(emirats)\b/i, 'ae'],
  [/\b(arabia|arab|qatar|al jazeera)\b/i, 'qa'],
  [/\b(japan|japon|nhk)\b/i, 'jp'],
  [/\b(korea|coré|coree)\b/i, 'kr'],
  [/\b(china|chine|chinese|cctv|chin)\b/i, 'cn'],
  [/\b(india|inde|indian)\b/i, 'in'],
  [/\b(austral|\babc\s*au\b|\bsbs\b)\b/i, 'au'],
  [/\b(roman)\b/i, 'ro'],
  [/\b(hungar|hongr|magyar)\b/i, 'hu'],
  [/\b(czech|česk|tchèq|tcheq)\b/i, 'cz'],
  [/\b(south africa|afrique du sud)\b/i, 'za'],
  [/\b(egypt|égypt|egypte)\b/i, 'eg'],
  [/\b(moroc|\b2m\b)\b/i, 'ma'],
  [/\b(alger)\b/i, 'dz'],
  [/\b(tunis)\b/i, 'tn'],
  [/\b(iran|irib)\b/i, 'ir'],
  [/\b(israel|israël|\bkan\b)\b/i, 'il'],
  [/\b(thai|thailand)\b/i, 'th'],
  [/\b(viet)\b/i, 'vn'],
  [/\b(philippin)\b/i, 'ph'],
  [/\b(indones)\b/i, 'id'],
  [/\b(pakistan)\b/i, 'pk'],
]

function extractTldFromId(id?: string): string | null {
  if (!id) return null
  const base = String(id).split('@')[0]
  const lastDot = base.lastIndexOf('.')
  if (lastDot < 0) return null
  const token = base.slice(lastDot + 1)
  return /^[a-z]{2}$/i.test(token) ? token : null
}

function detectFromUrl(url?: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    const labels = host.split('.')
    const tld = labels[labels.length - 1]
    if (tld && /^[a-z]{2}$/.test(tld) && !GENERIC_TLDS.has(tld)) {
      const code = normalizeCountryCode(tld)
      if (code) return code
    }
    if (labels.length >= 2) {
      const combo = `${labels[labels.length - 2]}.${tld}`
      const map: Record<string, string> = {
        'co.uk': 'gb', 'org.uk': 'gb', 'gov.uk': 'gb', 'ac.uk': 'gb',
        'com.br': 'br', 'com.au': 'au', 'co.nz': 'nz', 'com.mx': 'mx',
        'com.tr': 'tr', 'com.ar': 'ar', 'co.za': 'za', 'com.sa': 'sa',
        'com.eg': 'eg', 'co.id': 'id', 'com.pk': 'pk',
      }
      if (map[combo]) return map[combo]
    }
  } catch {
    /* ignore */
  }
  return null
}

function detectFromHost(url?: string): string | null {
  if (!url) return null
  try {
    const host = new URL(url).hostname.toLowerCase()
    for (const [suffix, code] of HOST_TO_COUNTRY) {
      if (host === suffix || host.endsWith('.' + suffix)) return code
    }
  } catch {
    /* ignore */
  }
  return null
}

function detectFromIp(url?: string): string | null {
  if (!url) return null
  try {
    const host = new URL(url).hostname
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null
    const first = Number(host.split('.')[0])
    if (CHINA_IP_FIRST_OCTETS.has(first)) return 'cn'
  } catch {
    /* ignore */
  }
  return null
}

function detectFromText(text?: string): string | null {
  if (!text) return null
  for (const [re, code] of COUNTRY_KEYWORDS) {
    if (re.test(text)) return code
  }
  // Also accept standalone 2-letter code tokens (e.g. a group titled "FR").
  const tokens = text.split(/[^a-zA-Z]+/)
  for (const tok of tokens) {
    if (/^[a-z]{2}$/i.test(tok)) {
      const code = normalizeCountryCode(tok)
      if (code) return code
    }
  }
  // CJK script hints (covers Chinese / Japanese / Korean channel names that
  // carry no Latin country keyword). Order matters: Hangul and Kana are
  // language-specific, while bare Hanzi defaults to China.
  if (/[가-힣]/.test(text)) return 'kr'
  if (/[぀-ヿ]/.test(text)) return 'jp'
  if (/[一-鿿]/.test(text)) return 'cn'
  return null
}

export interface CountryInput {
  country?: string
  countryCode?: string
  epgId?: string
  id?: string
  url?: string
  group?: string
  language?: string
  name?: string
}

export function detectCountryCode(ch: CountryInput): string | null {
  const fromExisting = normalizeCountryCode(ch.countryCode || ch.country)
  if (fromExisting) return fromExisting

  const fromId = normalizeCountryCode(
    extractTldFromId(ch.epgId) || extractTldFromId(ch.id),
  )
  if (fromId) return fromId

  const fromUrl = detectFromUrl(ch.url)
  if (fromUrl) return fromUrl

  const fromHost = detectFromHost(ch.url)
  if (fromHost) return fromHost

  const fromIp = detectFromIp(ch.url)
  if (fromIp) return fromIp

  const fromGroup = detectFromText(ch.group)
  if (fromGroup) return fromGroup

  if (ch.language) {
    const lc = LANGUAGE_TO_COUNTRY[ch.language.toLowerCase()]
    if (lc) return lc
  }

  const fromName = detectFromText(ch.name)
  if (fromName) return fromName

  return null
}

export function countryCodeToName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) || code
  } catch {
    return code
  }
}

// Fallback used when no signal at all can be derived. Chosen as the most
// common country in the aggregated catalog so the UI never shows "Inconnu".
export const FALLBACK_COUNTRY = 'us'

// Resolves a country code for a channel, falling back to FALLBACK_COUNTRY when
// no signal exists. Use this at storage/display time to guarantee every
// channel has a country.
export function resolveCountryCode(ch: CountryInput): string {
  return detectCountryCode(ch) || FALLBACK_COUNTRY
}
