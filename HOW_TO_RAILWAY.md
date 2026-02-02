# How to Deploy Backend to Railway and Connect the Frontend

Follow these steps in order.

---

## Part 1: Railway dashboard (website)

### Step 1 – Sign in and create a project

1. Open **https://railway.app** in your browser.
2. Sign in (e.g. with GitHub).
3. Click **“New Project”**.
4. Choose **“Empty project”** (or “Deploy from GitHub repo” if your code is already on GitHub).

### Step 2 – Add PostgreSQL

1. In the project, click **“+ New”**.
2. Click **“Database”** → **“PostgreSQL”**.
3. Wait until the Postgres service is created. Railway will show a service named something like “PostgreSQL”.

### Step 3 – Create the API service

1. Click **“+ New”** again.
2. Click **“GitHub Repo”** (or “Empty service” if you’ll connect the repo later).
3. Select the repository that contains your project (the one that has the `backend` folder).
4. After the service is created, click on it to open its settings.

### Step 4 – Configure the API service

1. Go to the **“Settings”** tab of the API service.
2. Find **“Root Directory”** and set it to: **`backend`**  
   (so Railway builds and runs from the `backend` folder).
3. **Build Command:** leave default or set to: **`npm run build`**.
4. **Start Command:** leave default or set to: **`npm start`**.
5. Find **“Service”** or **“Variables”** and **“Add dependency”** (or “Connect”) → select your **PostgreSQL** service.  
   This makes Railway set `DATABASE_URL` for the API.
6. In **“Variables”**, add:
   - **Name:** `JWT_SECRET`  
   - **Value:** a long random string (e.g. run in your terminal: `openssl rand -base64 32` and paste the result).

### Step 5 – Run the database schema (create tables)

You need to run the SQL that creates the tables **once** against the Postgres you just added.

**Option A – Using Railway’s Query tab**

1. In the project, click your **PostgreSQL** service.
2. Open the **“Data”** or **“Query”** tab (or “Connect” → open in a SQL client if available).
3. If there is a **“Query”** or **“New query”** area:
   - Open the file **`backend/database/schema.sql`** on your computer.
   - Copy **all** its contents and paste into the Query box.
   - Run / Execute the query.

**Option B – Using your terminal (if you have `psql` and the connection string)**

1. In Railway: click the **PostgreSQL** service → **“Variables”** or **“Connect”**.
2. Copy the **`DATABASE_URL`** value (it looks like `postgresql://user:password@host:port/railway?sslmode=require`).
3. On your computer, open a terminal and run (replace `YOUR_DATABASE_URL` with what you copied):

```bash
cd backend
psql "YOUR_DATABASE_URL" -f database/schema.sql
```

Example:

```bash
cd /Users/hamsi/Documents/PROJECT_CHARA/S&R_MIGRATION/backend
psql "postgresql://postgres:xxxxx@xxxxx.railway.app:5432/railway?sslmode=require" -f database/schema.sql
```

### Step 6 – Get your API URL

1. Click your **API service** (the one that runs the backend, not Postgres).
2. Go to **“Settings”** → **“Networking”** (or “Deploy”).
3. Click **“Generate Domain”** (or “Settings” → “Public networking”).
4. Copy the URL Railway gives you, e.g. **`https://something.up.railway.app`**.  
   This is your **API URL**. You will use it in the frontend.

---

## Part 2: Frontend (on your computer)

### Step 7 – Point the React app to the Railway API

1. Open your frontend folder (e.g. `biochar-bloom-main`).
2. Create or edit the **`.env`** file in that folder (same level as `package.json`).
3. Add this line (use the URL from Step 6, **no** trailing slash):

```env
VITE_API_URL=https://your-actual-api-url.up.railway.app
```

Example:

```env
VITE_API_URL=https://biochar-api-production-xxxx.up.railway.app
```

4. Save the file.
5. If the app was already running, restart it: stop with Ctrl+C, then run again:

```bash
npm run dev
```

---

## Part 3: Test

1. Open the React app in the browser (e.g. http://localhost:5173).
2. Use **Sign up** to create an account (email + password + name + role).
3. Then **Log in** with the same email and password.
4. If login works and you see the dashboard, the frontend is talking to the Railway backend.

---

## If something goes wrong

- **“Database connection” or “DATABASE_URL” errors**  
  Make sure the API service has the Postgres service added as a **dependency** (Step 4.5).

- **401 on login or on pages after login**  
  The app should send the JWT automatically. Ensure `VITE_API_URL` is set correctly and you restarted the dev server after changing `.env`.

- **Tables don’t exist / SQL errors**  
  Run the schema again (Step 5). Use the full contents of `backend/database/schema.sql`.

- **API service doesn’t start**  
  In Railway, open the API service → **“Deployments”** or **“Logs”** and check the build/run logs. Ensure Root Directory is `backend`, and that `npm run build` and `npm start` work locally in the `backend` folder.

---

## Summary checklist

- [ ] Railway project created
- [ ] PostgreSQL added
- [ ] API service added from GitHub (or empty and connected later)
- [ ] Root Directory = `backend`
- [ ] Postgres added as dependency to API service
- [ ] `JWT_SECRET` variable set on API service
- [ ] `backend/database/schema.sql` run once on Postgres
- [ ] API domain generated and URL copied
- [ ] Frontend `.env` has `VITE_API_URL=https://...` (your URL)
- [ ] Restart frontend (`npm run dev`) and test signup/login

---

## Automated deploy (after one-time setup)

Once the project, Postgres, API service, and variables are set in the Railway dashboard (Part 1), you can deploy from your computer or from GitHub without opening the dashboard.

### Option A – Deploy from your computer (CLI)

1. Install Railway CLI once:
   ```bash
   npm i -g @railway/cli
   ```
2. Log in once:
   ```bash
   railway login
   ```
3. From the **repo root**, link to your project once (choose your project and the **API** service):
   ```bash
   cd backend
   railway link
   cd ..
   ```
4. Deploy anytime:
   ```bash
   ./scripts/deploy-railway.sh
   ```
   Or from the backend folder:
   ```bash
   cd backend && npm run deploy
   ```

   To deploy **and** run the database schema (needs `psql` installed and link to a project that has `DATABASE_URL`):
   ```bash
   ./scripts/deploy-railway.sh --schema
   ```

### Option B – Deploy on every push (GitHub Actions)

1. In your GitHub repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Name: `RAILWAY_TOKEN`. Value: your Railway **project token** (Railway project → **Settings** → **Public API** → **Project token**).
3. Push your code (including the `.github/workflows/deploy-backend.yml` file) to the `main` branch. Pushes that change files under `backend/` will trigger a deploy.

After the first run, every push to `main` that touches `backend/` will deploy the backend automatically. You can also run the workflow manually: **Actions** → **Deploy Backend to Railway** → **Run workflow**.
