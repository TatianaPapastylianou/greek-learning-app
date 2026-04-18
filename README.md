# Greek Word Matcher

A collaborative Greek vocabulary learning app using a matching-pairs game. Shared word groups are password-protected per group, no user accounts.

## Stack

- **Frontend:** static HTML + CSS + vanilla JS (`public/`)
- **Database:** Supabase Postgres with `pgcrypto`-backed per-group passwords
- **Hosting:** Netlify (static) — no backend server
- **Design:** hand-drawn notebook aesthetic (Caveat + Indie Flower)

All mutations go through `SECURITY DEFINER` SQL functions that verify the group's bcrypt hash before allowing changes. The frontend uses the Supabase publishable key only.

## Run locally

The app is pure static — any HTTP server works:

```sh
python3 -m http.server --directory public 8000
```

Then open http://localhost:8000.

## Deploy

Push to `main`; Netlify auto-deploys from `public/`. Supabase config lives in `public/supabase.js`.
