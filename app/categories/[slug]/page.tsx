import React from 'react'
import ChannelCard from '../../components/ChannelCard/ChannelCard'

async function getChannelsForCategory(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/iptv/channels`)
  const json = await res.json()
  const list = json.data || []
  return list.filter((c: any) => (c.categories || []).map((s: string) => s.toLowerCase()).includes(slug.toLowerCase()))
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const channels = await getChannelsForCategory(slug)

  return (
    <main className="py-8">
      <h2 className="text-2xl font-semibold">Catégorie: {slug}</h2>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {channels.map((c: any) => (
          <ChannelCard
            key={c.id}
            id={c.id}
            name={c.name}
            country={c.country}
            logo={c.logo}
            categories={c.categories}
            streams={c.streams}
          />
        ))}
      </div>
    </main>
  )
}
