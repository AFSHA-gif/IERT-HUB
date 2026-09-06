import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('YOUR_SUPABASE') &&
  SUPABASE_URL.startsWith('https://')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const BUCKET_NAME = 'academic-materials';

export function getStorageModeInfo() {
  if (isSupabaseConfigured) {
    return {
      isCloud: true,
      provider: 'Supabase Cloud (PostgreSQL + Supabase Storage)',
      bucket: BUCKET_NAME,
      url: SUPABASE_URL
    };
  }
  return {
    isCloud: false,
    provider: 'Local Demo Engine (IndexedDB + LocalStorage)',
    bucket: 'local-indexeddb',
    url: 'http://localhost'
  };
}
