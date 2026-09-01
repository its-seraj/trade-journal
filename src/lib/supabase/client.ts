import { createBrowserClient } from '@supabase/ssr';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && url.startsWith('http') && !url.includes('demo-trading-journal'));
}

export function createClient() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-trading-journal.supabase.co';
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo';

  if (!supabaseUrl.startsWith('http')) {
    supabaseUrl = 'https://demo-trading-journal.supabase.co';
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
