"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BackButton() {
  const pathname = usePathname()
  const locale = (pathname || '').split('/')[1] || 'en'
  const href = `/${locale}`

  const labels: Record<string, string> = {
    en: 'Back',
    fr: 'Retour',
    es: 'Atrás',
    de: 'Zurück',
    ar: 'عودة'
  }
  const common = (key: string) => labels[locale] || labels.en

  return (
    <Link href={href} className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
      </svg>
      <span>{common('back')}</span>
    </Link>
  )
}
