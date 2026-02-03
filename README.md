
# AIXUM Portal Setup Guide

## 1. Supabase Project Setup
1. Crea un progetto su [Supabase](https://supabase.com/).
2. Vai nel **SQL Editor** ed esegui lo script fornito in `lib/supabase.ts` per creare le tabelle e abilitare RLS.
3. Vai in **Storage** e crea due bucket chiamati:
   - `videos` (imposta come Public)
   - `documents` (imposta come Public)

## 2. Configurazione Ambiente
Copia le chiavi API da Supabase (Settings -> API) nel tuo file `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=tua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua_chiave_anonima
```

## 3. Primo Utente Admin
Per creare il primo amministratore:
1. Registrati normalmente tramite auth o crea un utente manualmente da Supabase Dashboard.
2. Vai nella tabella `profiles` e modifica la riga del tuo utente:
   - Imposta `role` a `admin`.

## 4. Deploy su Vercel
1. Carica il codice su un repository GitHub.
2. Connetti il repository a Vercel.
3. Aggiungi le variabili d'ambiente configurate sopra.
4. Vercel rileverà automaticamente Next.js 14 e procederà con la build.

## Design Notes
Il portale segue rigorosamente il brand AIXUM:
- Colori: Gold (#D4AF37) e Deep Dark (#0a0a0a).
- Effetti: Glassmorphism e ombreggiature dorate.
- Typography: Display Serif (Playfair) per i titoli, Sans-Serif (Inter) per il corpo del testo.
