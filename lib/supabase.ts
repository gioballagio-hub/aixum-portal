
import { createClient } from '@supabase/supabase-js';

// Usiamo import.meta.env che è lo standard per Vite
// Su Vercel, dovrai inserire queste chiavi come Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iehjviidenkpmrlblebi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
