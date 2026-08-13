import { useTranslations } from 'next-intl'
import BackButton from '../components/BackButton'

export default function PrivacyPage() {
  const t = useTranslations('privacy')

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="mt-2 text-sm text-slate-600"><strong>{t('lastUpdated')}</strong></p>

      <section className="mt-6 space-y-4 text-sm text-slate-700">
        <p>{t.rich('intro1', { strong: (chunks) => <strong>{chunks}</strong> })}</p>

        <p>{t('intro2')}</p>

        <h2 className="mt-4 font-semibold">{t('s1Title')}</h2>
        <p>{t('s1Body')}</p>
        <p>
          <strong>{t('s1Name')}</strong>
        </p>
        <p>- {t('s1Email')}</p>
        <p>- {t('s1Site')}</p>

        <h2 className="mt-4 font-semibold">{t('s2Title')}</h2>
        <p>{t('s2Body')}</p>

        <h3 className="mt-2 font-medium">{t('s2_1Title')}</h3>
        <p>{t.rich('s2_1Body', { em: (chunks) => <em>{chunks}</em> })}</p>

        <h2 className="mt-4 font-semibold">{t('s3Title')}</h2>
        <p>{t('s3Body')}</p>
        <ul className="list-disc pl-6">
          {t.raw('s3List').map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p>{t.rich('s3Note', { strong: (chunks) => <strong>{chunks}</strong> })}</p>

        <h2 className="mt-4 font-semibold">{t('s4Title')}</h2>
        <p>{t('s4Body')}</p>

        <h2 className="mt-4 font-semibold">{t('s5Title')}</h2>
        <p>{t('s5Body')}</p>

        <h2 className="mt-4 font-semibold">{t('s6Title')}</h2>
        <p>{t('s6Body1')}</p>
        <p>{t('s6Body2')}</p>

        <h2 className="mt-4 font-semibold">{t('s8Title')}</h2>
        <p>{t('s8Body')}</p>

        <h2 className="mt-4 font-semibold">{t('s9Title')}</h2>
        <p>{t('s9Body')}</p>

        <h2 className="mt-4 font-semibold">{t('s10Title')}</h2>
        <p>{t('s10Body')}</p>

        <h2 className="mt-4 font-semibold">{t('s11Title')}</h2>
        <p>{t('s11Body')}</p>

        <h2 className="mt-4 font-semibold">{t('s12Title')}</h2>
        <p>{t('s12Body')}</p>

        <h2 className="mt-4 font-semibold">{t('s13Title')}</h2>
        <p>{t('s13Body')}</p>

        <h2 className="mt-4 font-semibold">{t('s14Title')}</h2>
        <p>{t('s14Body1')}</p>
        <p>
          {t.rich('s14Body2', {
            strong: (chunks) => <strong>{chunks}</strong>,
            br: () => <br />
          })}
        </p>

        <p className="mt-6 text-xs text-slate-500">{t('copyright')}</p>
      </section>
      </div>
    </main>
  )
}
