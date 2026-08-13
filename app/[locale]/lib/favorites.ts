import { supabase } from './supabaseClient'

export async function saveFavorite(channel: { id: string; name: string; country?: string; logo?: string; categories?: string[]; streams?: Array<{ url: string }> }, userId: string) {
  const payload = {
    user_id: userId,
    channel_id: channel.id,
    channel_name: channel.name,
    country: channel.country || null,
    logo: channel.logo || null,
    categories: channel.categories || [],
    streams: channel.streams || []
  }

  const { error } = await supabase.from('favorites').upsert(payload, { onConflict: 'user_id,channel_id' })
  return { error }
}

export async function removeFavorite(channelId: string, userId: string) {
  const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('channel_id', channelId)
  return { error }
}

export async function getFavorites(userId: string) {
  const { data, error } = await supabase.from('favorites').select('*').eq('user_id', userId)
  return { data, error }
}
