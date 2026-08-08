// supabaseConfig.js
//
// Supabase connection details for this app.
//
// This is safe to commit and safe to ship in the deployed site's JavaScript.
// The "anon" key is meant to be public — Supabase's Row Level Security (RLS)
// policies (see supabase/schema.sql) are what actually control who can read
// or write, not secrecy of this key. This is the same approach Supabase's
// own docs use for client-side apps.
//
// Fill in your own two values below, from your Supabase project:
// Project Settings -> API -> Project URL / anon public key.

export const SUPABASE_URL = "https://eucaminephgvvswzwfft.supabase.co";
export const SUPABASE_ANON_KEY = "sb_secret_c0AQfmsJz6rtp4yv35kdJg_NOyXS6VV";
