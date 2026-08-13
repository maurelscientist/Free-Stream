import { redirect } from 'next/navigation'
import { defaultLocale } from '../../../i18n/request'

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/${defaultLocale}/watch/${encodeURIComponent(id)}`)
}