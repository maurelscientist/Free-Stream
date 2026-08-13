import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import BackButton from '../components/BackButton'

export default function LegalPage() {
  const t = useTranslations('legal')
  const locale = useLocale()

  return (
    <main className="py-8 space-y-4">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <h1 className="text-2xl font-semibold">{t('title')}</h1>

      <section>
        <h2 className="font-semibold">{t('editorTitle')}</h2>
        <p>{t('editorSite')}</p>
        <p>{t('editorEmail')}</p>
      </section>

      <section>
        <h2 className="font-semibold">{t('directorTitle')}</h2>
        <p>{t('directorName')}</p>
      </section>

      <section>
        <h2 className="font-semibold">{t('hostingTitle')}</h2>
        <p>{t('hostingText')}</p>
      </section>

      <section>
        <h2 className="font-semibold">{t('sourceTitle')}</h2>
        <p>
          {t('sourceBody1')}
          {' '}
          <a href={t('sourceLink')} className="text-indigo-600 hover:underline">{t('sourceLink')}</a>
          {' '}{t('sourceBody2')}
        </p>
        <p>
          {t('sourceBody3')}
          {' '}
          <a href={t('sourceLink2')} className="text-indigo-600 hover:underline">{t('sourceLink2')}</a>
        </p>
      </section>

      <section>
        <h2 className="font-semibold">{t('ipTitle')}</h2>
        <p>{t('ipBody')}</p>
      </section>

      <section>
        <h2 className="font-semibold">{t('reportTitle')}</h2>
        <p>{t('reportBody')} <Link href={`/${locale}/report`} className="text-indigo-600 hover:underline">{t('reportLink')}</Link>.</p>
      </section>

      <section>
        <h2 className="font-semibold">{t('dataTitle')}</h2>
        <p>{t('dataBody')} <Link href={`/${locale}/privacy`} className="text-indigo-600 hover:underline">{t('dataLink')}</Link>.</p>
      </section>

      <section>
        <h2 className="font-semibold">{t('cookiesTitle')}</h2>
        <p>{t('cookiesBody')} <Link href={`/${locale}/cookies`} className="text-indigo-600 hover:underline">{t('cookiesLink')}</Link>.</p>
      </section>

      <section>
        <p className="text-sm text-slate-600">{t('updated')}</p>
      </section>
      </div>
    </main>
  )
}
