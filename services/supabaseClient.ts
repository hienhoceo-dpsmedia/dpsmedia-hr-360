import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (window as any).ENV?.VITE_SUPABASE_URL?.startsWith('__')
  ? import.meta.env.VITE_SUPABASE_URL
  : ((window as any).ENV?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL);

const supabaseAnonKey = (window as any).ENV?.VITE_SUPABASE_ANON_KEY?.startsWith('__')
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : ((window as any).ENV?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing! Please check environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
