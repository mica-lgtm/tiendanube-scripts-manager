import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

export const supabaseServer = supabaseUrl && (process.env.SUPABASE_SERVICE_KEY || supabaseAnonKey)
  ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_KEY || supabaseAnonKey
    )
  : null as any;
