
import { createClient } from '@supabase/supabase-js';

/**
 * Funzione helper per recuperare variabili d'ambiente in modo sicuro
 * cercando tra diverse possibili convenzioni (Vite, Next.js, Process).
 */
const getEnvVar = (key: string): string => {
  // 1. Cerca in process.env (Node/Next.js/Vercel shim)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {}
  
  // 2. Cerca in import.meta.env (Vite)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key] as string;
    }
  } catch (e) {}

  return '';
};

// Configurazione URL e Anon Key con fallback per evitare crash
const supabaseUrl = 
  getEnvVar('VITE_SUPABASE_URL') || 
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || 
  'https://iehjviidenkpmrlblebi.supabase.co';

const supabaseAnonKey = 
  getEnvVar('VITE_SUPABASE_ANON_KEY') || 
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Log di stato per facilitare il debug su Vercel
if (!supabaseAnonKey || supabaseAnonKey === '') {
  console.warn("⚠️ AIXUM Portal: Chiave Supabase non rilevata. Verifica le Environment Variables su Vercel.");
} else {
  console.log("✅ AIXUM Portal: Connessione Supabase configurata.");
}

/**
 * Inizializzazione del client Supabase.
 */
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey || 'MISSING_KEY_FALLBACK'
);
