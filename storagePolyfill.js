// storagePolyfill.js
//
// The app (src/App.jsx) was originally built for Claude.ai's artifact runtime,
// which provides a `window.storage.get/set/delete/list` API for free. That API
// does NOT exist outside of Claude.ai — so on Netlify, without this file,
// every call to window.storage would throw and nothing would save or sync.
//
// This file recreates that exact same API, so App.jsx needs ZERO changes.
// Under the hood:
//   - shared = true  -> stored in Supabase (so every visitor sees the same data)
//   - shared = false -> stored in this browser's localStorage (personal only:
//                        this browser's user-id and remembered name)
//
// IMPORTANT: import this file BEFORE importing App, so window.storage exists
// before the component's effects run. See src/main.jsx.

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseConfig.js";

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes("YOUR-PROJECT-REF") || !supabaseAnonKey || supabaseAnonKey.includes("YOUR-ANON")) {
  // Fails loudly in the browser console instead of silently doing nothing —
  // this almost always means src/supabaseConfig.js still has placeholder values.
  console.error(
    "[storagePolyfill] supabaseConfig.js still has placeholder values. " +
    "Edit src/supabaseConfig.js with your real Supabase URL and anon key, then redeploy."
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const TABLE = "kv_shared";

function localGet(key) {
  const value = window.localStorage.getItem(key);
  if (value === null) {
    // Matches the artifact API: get() on a missing key rejects, it doesn't
    // resolve to null. App.jsx already wraps its get() calls in try/catch.
    throw new Error(`Key not found: ${key}`);
  }
  return { key, value, shared: false };
}

function localSet(key, value) {
  window.localStorage.setItem(key, value);
  return { key, value, shared: false };
}

function localDelete(key) {
  window.localStorage.removeItem(key);
  return { key, deleted: true, shared: false };
}

function localList(prefix) {
  const keys = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(prefix)) keys.push(k);
  }
  return { keys, prefix, shared: false };
}

window.storage = {
  async get(key, shared = false) {
    if (!shared) return localGet(key);
    const { data, error } = await supabase
      .from(TABLE)
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Key not found: ${key}`);
    return { key, value: data.value, shared: true };
  },

  async set(key, value, shared = false) {
    if (!shared) return localSet(key, value);
    const { error } = await supabase
      .from(TABLE)
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
    return { key, value, shared: true };
  },

  async delete(key, shared = false) {
    if (!shared) return localDelete(key);
    const { error } = await supabase.from(TABLE).delete().eq("key", key);
    if (error) throw error;
    return { key, deleted: true, shared: true };
  },

  async list(prefix = "", shared = false) {
    if (!shared) return localList(prefix);
    const { data, error } = await supabase
      .from(TABLE)
      .select("key")
      .like("key", `${prefix}%`);
    if (error) throw error;
    return { keys: (data || []).map((r) => r.key), prefix, shared: true };
  },
};
