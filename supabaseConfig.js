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
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Y2FtaW5lcGhndnZzd3p3ZmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMTAyMzQsImV4cCI6MjEwMTc4NjIzNH0.RP2y_zcVGrDwUPF3Ir4zH5zT67bmwbV8yy91f76UveY";
