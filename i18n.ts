import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// Can be imported from a shared config
export const locales = ['en', 'fr', 'es', 'de', 'ar'] as const
export const defaultLocale = 'en' as const

export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => {
  const activeLocale = locale ?? defaultLocale

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(activeLocale as Locale)) notFound()

  return {
    locale: activeLocale,
    messages: (await import(`./messages/${activeLocale}.json`)).default
  }
})