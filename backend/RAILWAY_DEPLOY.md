# Deploy Biochar API to Railway

## 1. Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in (GitHub is easiest).
2. Click **New Project**.
3. Choose **Deploy from GitHub repo** and select your repo (or **Empty project** and we’ll add the backend next).

## 2. Add PostgreSQL

1. In the project, click **+ New** → **Database** → **PostgreSQL**.
2. Railway creates a Postgres service and sets `DATABASE_URL` for you.
3. Open the Postgres service → **Data** (or **Connect**) and copy the connection string if you need it for running migrations from your machine.

## 3. Run the database schema

**Option A – Railway CLI (recommended)**

1. Install Railway CLI: `npm i -g @railway/cli` (or see [docs](https://docs.railway.app/develop/cli)).
2. Login: `railway login`.
3. Link the project: `railway link` (choose the project and the Postgres service).
4. Run the schema:
   ```bash
   cd backend
   railway run psql $DATABASE_URL -f database/schema.sql
   ```
   Or run the SQL manually: open Railway Postgres → **Query** and paste the contents of `backend/database/schema.sql`, then execute.

**Option B – From your machine**

1. In Railway dashboard: Postgres service → **Variables** (or **Connect**) and copy `DATABASE_URL`.
2. From your terminal (with `psql` installed):
   ```bash
   cd backend
   psql "PASTE_DATABASE_URL_HERE" -f database/schema.sql
   ```

## 4. Deploy the API service

1. In the same Railway project, click **+ New** → **GitHub Repo** (or **Empty service** and connect repo later).
2. Choose the repo that contains the `backend` folder.
3. In the new service:
   - **Settings** → **Root Directory**: set to `backend` (if the repo root is the parent of `backend`).
   - **Settings** → **Build Command**: `npm run build` (or leave default if Nixpacks detects it).
   - **Settings** → **Start Command**: `npm start`.
4. **Variables** (for the API service, not Postgres):
   - `JWT_SECRET`: generate a long random string (e.g. `openssl rand -base64 32`) and add it.
   - Do **not** set `DATABASE_URL` manually; add the Postgres dependency so Railway injects it:
     - **Settings** → **Service** → **Add dependency** → select your Postgres service. Railway will add `DATABASE_URL` to this service.
5. Deploy: push to the connected branch or click **Deploy** in the dashboard.
6. After deploy, open **Settings** → **Networking** → **Generate Domain** to get a URL like `https://your-api.up.railway.app`.

## 5. Frontend: point to Railway API

In your React app (e.g. `biochar-bloom-main`):

1. Add env var for the API base URL, e.g. in `.env` or `.env.production`:
   ```env
   VITE_API_URL=https://your-api.up.railway.app
   ```
2. Use this base URL for all API calls:
   - Auth: `POST ${VITE_API_URL}/api/auth/login`, `POST ${VITE_API_URL}/api/auth/signup`.
   - Data: `GET/POST/PATCH/DELETE ${VITE_API_URL}/api/...` with header `Authorization: Bearer <token>`.
3. Store the JWT from login/signup (e.g. in memory or localStorage) and send it on every request in `Authorization: Bearer <token>`.

If you previously used Supabase client only, you’ll need to replace those calls with `fetch()` (or an API client) to `${VITE_API_URL}/api/...` and use the new auth responses (e.g. `session.access_token`, `user`). The backend README lists all endpoints and payloads.

## 6. Optional: same repo, root directory

If your repo structure is:

```
your-repo/
  backend/    <- API
  biochar-bloom-main/  <- Frontend
```

then in Railway, for the API service, set **Root Directory** to `backend` so the build and start commands run from there.

---

**Troubleshooting**

- **DB connection errors:** Ensure the API service has the Postgres service as a dependency so `DATABASE_URL` is set.
- **401 on protected routes:** Send `Authorization: Bearer <jwt>`; use the token from `/api/auth/login` or `/api/auth/signup`.
- **CORS:** The API allows all origins (`cors({ origin: true })`). Restrict in production if needed.
