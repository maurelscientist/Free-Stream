import { useTranslations } from 'next-intl'
import BackButton from '../components/BackButton'

export default function CookiesPage() {
  const t = useTranslations('cookies')

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4 prose prose-slate max-w-none">
        <BackButton />
      <h1>{t('title')}</h1>
      <p>
        <strong>{t('lastUpdated')}</strong>
      </p>
      <p>{t.rich('intro', { strong: (chunks) => <strong>{chunks}</strong> })}</p>

      <h2>{t('s1Title')}</h2>
      <p>{t('s1Body1')}</p>
      <p>{t('s1Body2')}</p>

      <h2>{t('s2Title')}</h2>
      <p>{t('s2Body')}</p>
      <ul>
        {t.raw('s2List').map((item: string, i: number) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{t('s3Title')}</h2>
      <p>{t('s3Body1')}</p>
      <p>{t('s3Body2')}</p>
      <ul>
        {t.raw('s3List').map((item: string, i: number) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>{t('s3Body3')}</p>

      <h2>{t('s4Title')}</h2>
      <p>{t.rich('s4Body1', { strong: (chunks) => <strong>{chunks}</strong> })}</p>
      <p>{t('s4Body2')}</p>
      <p>{t('s4Body3')}</p>
      <ul>
        {t.raw('s4List').map((item: string, i: number) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>{t('s4Body4')}</p>
      <p>{t('s4Body5')}</p>

      <h2>{t('s5Title')}</h2>
      <p>{t('s5Body1')}</p>
      <p>{t('s5Body2')}</p>
      <ul>
        {t.raw('s5List').map((item: string, i: number) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>{t('s5Body3')}</p>
      <p>{t('s5Body4')}</p>

      <h2>{t('s6Title')}</h2>
      <p>{t('s6Body1')}</p>
      <p>{t('s6Body2')}</p>
      <p>{t('s6Body3')}</p>

      <h2>{t('s7Title')}</h2>
      <p>{t('s7Body1')}</p>
      <ul>
        {t.raw('s7List').map((item: string, i: number) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>{t('s7Body2')}</p>
      <p>{t('s7Body3')}</p>

      <h2>{t('s8Title')}</h2>
      <p>{t('s8Body1')}</p>
      <p>{t('s8Body2')}</p>
      <p>{t('s8Body3')}</p>

      <h2>{t('s9Title')}</h2>
      <p>{t('s9Body1')}</p>
      <p>{t('s9Body2')}</p>
      <ul>
        {t.raw('s9List').map((item: string, i: number) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>{t('s9Body3')}</p>

      <h2>{t('s10Title')}</h2>
      <p>{t('s10Body1')}</p>
      <p>{t('s10Body2')}</p>
      <ul>
        {t.raw('s10List').map((item: string, i: number) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>{t('s10Body3')}</p>

      <h2>{t('s11Title')}</h2>
      <p>{t('s11Body1')}</p>
      <p>{t('s11Body2')}</p>

      <h2>{t('s12Title')}</h2>
      <p>{t('s12Body1')}</p>
      <p>{t('s12Body2')}</p>

      <h2>{t('s13Title')}</h2>
      <p>{t('s13Body1')}</p>
      <p>
        {t.rich('s13Body2', {
          strong: (chunks) => <strong>{chunks}</strong>,
          br: () => <br />
        })}
      </p>

      <hr />
      <p>
        <strong>{t('copyright')}</strong>
      </p>
      </div>
    </main>
  )
}
