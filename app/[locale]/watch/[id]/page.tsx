import VideoPlayer from '../../../components/VideoPlayer/VideoPlayer'
import BackButton from '../../../components/BackButton'
import { fetchChannels, findChannel } from '../../../lib/iptv'
import { buildStreamCandidates, isValidUrl } from '../../../lib/iptv/streamSelection'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getCountryName } from '../../../lib/utils/country'
import { FALLBACK_COUNTRY } from '../../../lib/iptv/countryDetect'

async function getChannel(id: string) {
  const channels = await fetchChannels()
  return findChannel(channels, id)
}

export default async function WatchPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id: rawId } = await params
  setRequestLocale(locale)
  const id = decodeURIComponent(rawId)
  const channel = await getChannel(id)

  const t = await getTranslations('watch')
  const common = await getTranslations('common')

  const streams = channel?.streams || []
  const streamList = buildStreamCandidates(streams)
  const stream = streamList[0] || ''

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <h2 className="text-xl font-semibold">{channel?.name ?? t('unknownChannel')}</h2>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {stream ? (
            <VideoPlayer streamUrls={streamList} streamUrl={stream} channelName={channel?.name} logo={channel?.logo} autoplay />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-slate-700">{t('noStream')}</p>
            </div>
          )}
        </div>

        <aside className="md:col-span-1">
          <div className="rounded border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-3">
              <div className="text-sm text-slate-500 dark:text-slate-400">{common('channel')}</div>
              <div className="font-semibold">{channel?.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{getCountryName(channel?.countryCode || channel?.country || FALLBACK_COUNTRY, locale)}</div>
            </div>

            {streamList.length > 0 ? (
              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('sources', { count: streamList.length })}</div>
                <ul className="mt-2 list-disc pl-5 space-y-2 text-xs">
                  {streamList.map((url: string, index: number) => (
                    <li key={index} className="break-all">
                      <a href={url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline break-words dark:text-indigo-400">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('noValidStream')}</div>
            )}
          </div>
        </aside>
      </div>
      </div>
    </main>
  )
}
