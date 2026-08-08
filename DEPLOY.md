# Deploying the Delivery Dispatch Board (Supabase + Netlify)

This turns the Claude.ai artifact into a real, standalone website that any
teammate can open in a browser, with live data shared across everyone.

## What changed vs. the Claude.ai version

The app used to save data through `window.storage`, an API that only exists
inside Claude.ai. Outside of Claude.ai, that API doesn't exist, so nothing
would save or sync without a replacement.

`src/storagePolyfill.js` recreates that exact same API — same function names,
same arguments — but backed by a real database (Supabase) instead. Because
of that, `src/App.jsx` (your actual calendar app) did **not** need to be
rewritten. Every feature you've built — the calendar, drag-and-drop,
critical flags, the dashboard, Excel intake, all of it — works unchanged.

## Part 1 — Supabase (the database)

1. Go to https://supabase.com, sign in, and click **New Project**.
   - Pick any name and password (save the password somewhere; you likely
     won't need it again for this app).
   - Pick a region close to your team.
2. Once the project finishes provisioning, open **SQL Editor** in the left
   sidebar, click **New query**, paste in the entire contents of
   `supabase/schema.sql` (included in this project), and click **Run**.
   - This creates one table, `kv_shared`, with permissive read/write access
     for anyone holding the project's public key — matching how the app
     behaves today (anyone with the link can view and edit).
3. Go to **Project Settings → API**. You'll need two values from this page
   in a moment:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

That's the entire database setup — one table, no servers to manage.

## Part 2 — Add your Supabase credentials to the code

Some Netlify plans restrict the environment-variables UI, so this project
skips that entirely: your Supabase URL and key just live directly in a file.
This is safe — the "anon" key is meant to be public; Supabase's Row Level
Security policies (the ones `schema.sql` sets up) are what actually control
access, not secrecy of this key.

Open **`src/supabaseConfig.js`** and replace the two placeholder values with
the ones you copied in Part 1:

```js
export const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOi...(your real key)...";
```

Save the file. That's the only code edit needed.

## Part 3 — Get the code onto GitHub (recommended)

Netlify deploys most smoothly from a Git repository, so it can rebuild
automatically whenever you push a change.

1. Create a new, empty repository on GitHub (e.g. `delivery-dispatch-board`).
2. From this project folder on your computer:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/delivery-dispatch-board.git
   git push -u origin main
   ```

(If you'd rather not use Git, Netlify also supports dragging a pre-built
`dist` folder onto their dashboard — see the "no-Git alternative" note at
the bottom of this file. That path works too and needs nothing extra.)

## Part 4 — Netlify

1. Go to https://app.netlify.com, sign in, and click **Add new site → Import
   an existing project**.
2. Connect your GitHub account and pick the repository you just pushed.
3. Netlify should auto-detect the build settings from `netlify.toml`
   (build command `npm run build`, publish directory `dist`) — confirm and
   deploy.
4. That's it — no environment variables to set, since your credentials are
   already baked into `src/supabaseConfig.js` from Part 2.
5. Once the deploy finishes, Netlify gives you a live URL
   (like `random-name-123.netlify.app`). Share that with your team.
   You can rename it or attach a custom domain under **Domain settings**.

## Part 5 — Confirm it's live and syncing

1. Open the Netlify URL in two different browsers (or one regular + one
   private/incognito window, so they count as two different users).
2. Each should prompt for a first/last name — enter different names in each.
3. In one window, drag a company onto a date and confirm a delivery.
4. Within about 4 seconds, it should appear in the other window without
   refreshing — and you should see both names' initials as circles in the
   top-right corner.

If it doesn't sync, check the browser console (F12 → Console) for errors —
almost always this means `src/supabaseConfig.js` still has the placeholder
values, or they were copied with a typo.

## Updating your Supabase credentials later

If you ever need to change projects or rotate the key, just edit the two
values in `src/supabaseConfig.js` and redeploy (push to GitHub if connected,
or rebuild + re-drag the `dist` folder if deploying manually).

## About the auto-update / sync behavior

This is polling-based, the same as the Claude.ai version: every open tab
checks Supabase for newer data roughly every 4 seconds, and saves its own
changes about 400ms after you make them. That means:

- Any change (delivery added, moved, marked critical, deleted, company
  added, etc.) shows up for everyone else within a few seconds.
- It is **not** instant, sub-second push — that would require adding
  Supabase Realtime subscriptions, which is a reasonable next step if a
  few seconds of lag ever matters for your team. Let me know if you'd like
  that added.
- If two people edit the exact same thing in the same instant, the later
  save wins (no automatic merging of conflicting edits).

## Security note

The Supabase policies in `schema.sql` allow **anyone with the anon key**
(which is public, embedded in the deployed site's JavaScript either way —
whether it comes from an environment variable or this config file makes no
difference to its exposure) to read and write the calendar data. This
matches the app's current design — there's no login, just a name prompt —
so anyone with your Netlify URL can use and edit the board. That's almost
certainly fine for an internal team tool, but if you ever want to restrict
access (e.g. require a company login, or make some users view-only), that's
a Supabase Auth change I can help you add later — it does not require
rebuilding anything you have today.

## No-Git alternative

If you don't want to use GitHub:
```bash
npm install
npm run build
```
This produces a `dist/` folder. On Netlify, choose **Add new site → Deploy
manually** and drag that `dist` folder onto the page. You'll need to repeat
this manually any time you want to update the site. Since your Supabase
credentials are baked into the code (Part 2) rather than set in Netlify's
UI, there's no extra environment-variable step to worry about here either.
