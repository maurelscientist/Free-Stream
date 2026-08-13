import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://joyyegpyyitzufxdmlyc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8sMUX4b4n8fVHsu8ecU__g_XxajRMsH'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
