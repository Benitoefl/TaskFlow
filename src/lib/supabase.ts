import { createClient, SupabaseClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''

// Valida se a URL fornecida é realmente uma URL válida (não uma chave de API colada por engano)
function isValidSupabaseUrl(url: string): boolean {
  if (!url || url.includes('seu-projeto')) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const isSupabaseConfigured = isValidSupabaseUrl(rawUrl) && Boolean(rawKey) && !rawKey.includes('sua-chave')

let client: SupabaseClient

if (isSupabaseConfigured) {
  try {
    client = createClient(rawUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  } catch (err) {
    console.error('Erro ao inicializar cliente Supabase:', err)
    client = createClient('https://placeholder.supabase.co', 'dummy-anon-key', {
      auth: { persistSession: false },
    })
  }
} else {
  client = createClient('https://placeholder.supabase.co', 'dummy-anon-key', {
    auth: { persistSession: false },
  })
}

export const supabase = client
