const COUNTRY_CODE_ALIASES: Record<string, string> = {
  uk: 'gb',
  usa: 'us',
  uae: 'ae',
  za: 'za',
}

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'united states': 'us',
  usa: 'us',
  america: 'us',
  'united kingdom': 'gb',
  britain: 'gb',
  england: 'gb',
  scotland: 'gb',
  wales: 'gb',
  'south korea': 'kr',
  korea: 'kr',
  'north korea': 'kp',
  'czech republic': 'cz',
  'russia': 'ru',
  'united arab emirates': 'ae',
  'south africa': 'za',
  'ivory coast': 'ci',
  'côte d\'ivoire': 'ci',
  'burma': 'mm',
  'myanmar': 'mm',
  'vietnam': 'vn',
  'iran': 'ir',
  'laos': 'la',
  'syrian arab republic': 'sy',
  'syria': 'sy',
  'north macedonia': 'mk',
  'bolivia': 'bo',
  'tanzania': 'tz',
  'venezuela': 've',
  'palestine': 'ps',
  'congo': 'cg',
  'democratic republic of the congo': 'cd',
  'czechia': 'cz',
  'east timor': 'tl',
  'cape verde': 'cv',
  'swaziland': 'sz',
  'brunei': 'bn',
}

export function normalizeCountryCode(value?: string): string | null {
  if (!value) return null

  let code = String(value).trim().toLowerCase()
  if (!code) return null

  if (code.length === 2 && /^[a-z]{2}$/.test(code)) {
    return COUNTRY_CODE_ALIASES[code] || code
  }

  code = code.replace(/_/g, ' ').replace(/-/g, ' ')
  if (COUNTRY_NAME_TO_CODE[code]) {
    return COUNTRY_NAME_TO_CODE[code]
  }

  if (code.length === 3 && /^[a-z]{3}$/.test(code)) {
    const alias = COUNTRY_CODE_ALIASES[code]
    return alias || null
  }

  return null
}

export function getCountryFlagUrl(value?: string, size = 80): string | null {
  const code = normalizeCountryCode(value)
  if (!code) return null
  return `https://flagcdn.com/w${size}/${code}.png`
}

export function getCountryName(value?: string, locale = 'en'): string {
  if (!value) return ''
  const code = normalizeCountryCode(value)
  if (code) {
    try {
      return new Intl.DisplayNames([locale], { type: 'region' }).of(code.toUpperCase()) || value
    } catch {
      return value
    }
  }
  return value
}

const CATEGORY_NAMES: Record<string, Record<string, string>> = {
  en: {
    Animation: 'Animation', Auto: 'Auto', Business: 'Business', Classic: 'Classic', Comedy: 'Comedy',
    Cooking: 'Cooking', Culture: 'Culture', Documentary: 'Documentary', Education: 'Education', Entertainment: 'Entertainment',
    Family: 'Family', General: 'General', Kids: 'Kids', Legislative: 'Legislative', Lifestyle: 'Lifestyle',
    Movies: 'Movies', Music: 'Music', News: 'News', Outdoor: 'Outdoor', Public: 'Public',
    Relax: 'Relax', Religious: 'Religious', Science: 'Science', Series: 'Series', Shop: 'Shop',
    Sports: 'Sports', Travel: 'Travel', Undefined: 'Undefined', Weather: 'Weather',
  },
  fr: {
    Animation: 'Animation', Auto: 'Automobile', Business: 'Affaires', Classic: 'Classique', Comedy: 'Comédie',
    Cooking: 'Cuisine', Culture: 'Culture', Documentary: 'Documentaire', Education: 'Éducation', Entertainment: 'Divertissement',
    Family: 'Famille', General: 'Général', Kids: 'Enfants', Legislative: 'Législatif', Lifestyle: 'Style de vie',
    Movies: 'Films', Music: 'Musique', News: 'Actualités', Outdoor: 'Plein air', Public: 'Public',
    Relax: 'Détente', Religious: 'Religieux', Science: 'Science', Series: 'Séries', Shop: 'Shopping',
    Sports: 'Sport', Travel: 'Voyage', Undefined: 'Indéfini', Weather: 'Météo',
  },
  es: {
    Animation: 'Animación', Auto: 'Automóvil', Business: 'Negocios', Classic: 'Clásico', Comedy: 'Comedia',
    Cooking: 'Cocina', Culture: 'Cultura', Documentary: 'Documental', Education: 'Educación', Entertainment: 'Entretenimiento',
    Family: 'Familia', General: 'General', Kids: 'Niños', Legislative: 'Legislativo', Lifestyle: 'Estilo de vida',
    Movies: 'Películas', Music: 'Música', News: 'Noticias', Outdoor: 'Aire libre', Public: 'Público',
    Relax: 'Relax', Religious: 'Religioso', Science: 'Ciencia', Series: 'Series', Shop: 'Compras',
    Sports: 'Deportes', Travel: 'Viajes', Undefined: 'Indefinido', Weather: 'Clima',
  },
  de: {
    Animation: 'Animation', Auto: 'Auto', Business: 'Wirtschaft', Classic: 'Klassik', Comedy: 'Komödie',
    Cooking: 'Kochen', Culture: 'Kultur', Documentary: 'Dokumentation', Education: 'Bildung', Entertainment: 'Unterhaltung',
    Family: 'Familie', General: 'Allgemein', Kids: 'Kinder', Legislative: 'Gesetzgebung', Lifestyle: 'Lifestyle',
    Movies: 'Filme', Music: 'Musik', News: 'Nachrichten', Outdoor: 'Outdoor', Public: 'Öffentlich',
    Relax: 'Entspannung', Religious: 'Religiös', Science: 'Wissenschaft', Series: 'Serien', Shop: 'Shop',
    Sports: 'Sport', Travel: 'Reisen', Undefined: 'Undefiniert', Weather: 'Wetter',
  },
  ar: {
    Animation: 'رسوم متحركة', Auto: 'سيارات', Business: 'أعمال', Classic: 'كلاسيكي', Comedy: 'كوميديا',
    Cooking: 'طبخ', Culture: 'ثقافة', Documentary: 'وثائقي', Education: 'تعليم', Entertainment: 'ترفيه',
    Family: 'عائلة', General: 'عام', Kids: 'أطفال', Legislative: 'تشريعي', Lifestyle: 'نمط الحياة',
    Movies: 'أفلام', Music: 'موسيقى', News: 'أخبار', Outdoor: 'في الهواء الطلق', Public: 'عامة',
    Relax: 'استرخاء', Religious: 'ديني', Science: 'علوم', Series: 'مسلسلات', Shop: 'تسوق',
    Sports: 'رياضة', Travel: 'سفر', Undefined: 'غير محدد', Weather: 'طقس',
  },
}

export function getCategoryName(value?: string, locale = 'en'): string {
  if (!value) return ''
  const map = CATEGORY_NAMES[locale] || CATEGORY_NAMES.en
  return map[value] || CATEGORY_NAMES.en[value] || value
}
