import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Clean SUPABASE_URL to prevent "Invalid path specified in request URL" errors
export const SUPABASE_URL = rawUrl
  .replace(/['"]/g, '')
  .replace(/\/+$/, '')
  .replace(/\/(rest|auth)\/v\d+$/i, '')
  .replace(/\/+$/, '');

export const SUPABASE_ANON_KEY = rawKey.replace(/['"]/g, '');

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
