# Production deploy (no .env.local)

In **production**, the app uses **VITE_API_URL** set at **build time** by your hosting platform (Railway, Vercel, etc.). No `.env.local` on the server.

---

## 1. Backend (API) – already on Railway

Your API (S-R_Chara) is on Railway. Note its public URL (e.g. `https://s-r-chara-production-xxxx.up.railway.app`). You need it for the frontend.

---

## 2. Frontend – deploy to Railway (same project)

1. In **Railway**, same project → **+ New** → **GitHub Repo** → same repo.
2. For the **new service** (e.g. "biochar-web"):
   - **Settings** → **Root Directory**: **`biochar-bloom-main`**
   - **Settings** → **Build Command**: **`npm ci && npm run build`**
   - **Settings** → **Start Command**: **`npx serve -s dist -l $PORT`**
3. **Variables** → add:
   - **Name:** `VITE_API_URL`  
   - **Value:** your **backend** URL, e.g. `https://s-r-chara-production-xxxx.up.railway.app`  
   (No slash at the end.)
4. Deploy. Then **Settings** → **Networking** → **Generate Domain** for the frontend.

Users open the **frontend** URL; the app will call the **backend** URL (VITE_API_URL) for auth and data. No `.env.local` in production.

---

## 3. Frontend – deploy to Vercel (alternative)

1. Import the repo in **Vercel**.
2. **Root Directory**: **`biochar-bloom-main`**.
3. **Build Command**: `npm run build` (default).
4. **Environment variables** (Build):
   - **Name:** `VITE_API_URL`  
   - **Value:** your Railway backend URL (e.g. `https://s-r-chara-production-xxxx.up.railway.app`).
5. Deploy. Vercel will build with that URL; no `.env.local` needed.

---

## Summary

| Where        | VITE_API_URL set at build time      | No .env.local |
|-------------|--------------------------------------|----------------|
| **Railway** | Variables tab for the frontend service | Yes            |
| **Vercel**  | Environment variables for the project | Yes            |

Use your **backend** URL (S-R_Chara) as **VITE_API_URL** so the production frontend talks to your production API.
