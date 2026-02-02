# Step-by-step: What to do now

Do these steps **in order**. Check off each when done.

---

## Step 1: Open Railway and create a project

1. Go to **https://railway.app** in your browser.
2. Sign in (e.g. **Login with GitHub**).
3. Click **"New Project"**.
4. Click **"Empty project"** (or "Deploy from GitHub repo" if your code is already on GitHub).
5. You should see an empty project with a **"+ New"** button.

---

## Step 2: Add a PostgreSQL database

1. Click **"+ New"** in the project.
2. Click **"Database"**.
3. Click **"PostgreSQL"**.
4. Wait until the service appears (name like "PostgreSQL"). Leave this tab open.

---

## Step 3: Add your backend (API) service

1. Click **"+ New"** again (in the same project).
2. Click **"GitHub Repo"** (if your code is on GitHub) or **"Empty service"** (if not).
3. If GitHub: choose the repo that contains the **backend** folder (e.g. your S&R_MIGRATION or biochar repo).
4. A new service is created. Click on **that service** (not Postgres) to open it.

---

## Step 4: Configure the API service

1. In the **API service** (not Postgres), open the **"Settings"** tab.
2. Find **"Root Directory"** and type: **`backend`**  
   (so Railway builds from the `backend` folder).
3. **Build Command:** set to **`npm run build`** (or leave default).
4. **Start Command:** set to **`npm start`** (or leave default).
5. Find **"Variables"** or **"Connect"** and **"Add dependency"** (or "Reference") → choose your **PostgreSQL** service.  
   This gives the API a `DATABASE_URL` variable.
6. In **"Variables"**, click **"+ New variable"** or **"Add variable"**:
   - **Variable name:** `JWT_SECRET`
   - **Value:** open your computer’s terminal and run:
     ```bash
     openssl rand -base64 32
     ```
     Copy the output and paste it as the value. Save.

---

## Step 5: Create the database tables (run schema once)

1. In Railway, click your **PostgreSQL** service (not the API).
2. Open the **"Data"** or **"Query"** tab.  
   If you see **"Query"** or **"New query"**, use that.
3. On your computer, open this file in your project:  
   **`backend/database/schema.sql`**
4. Select **all** the text in that file and copy it.
5. Paste it into the Railway Query box.
6. Click **Run** or **Execute**.
7. You should see success (no red errors). Tables are now created.

**If there is no Query tab – use Node (no `psql` needed):**  
1. In Postgres service, open **"Variables"** or **"Connect"** and copy **`DATABASE_URL`**.  
2. On your computer, open a terminal. **Use quotes** around the path (because of `&` in the folder name):

```bash
cd "/Users/hamsi/Documents/PROJECT_CHARA/S&R_MIGRATION/backend"
```

3. Create a file **`.env`** in the `backend` folder with one line (paste your real URL):

```
DATABASE_URL=postgresql://postgres:xxxxx@host.railway.app:5432/railway?sslmode=require
```

4. Run:

```bash
npm run db:schema:local
```

---

## Step 6: Get your API URL

1. In Railway, click your **API service** again (the one with Root Directory = `backend`).
2. Open **"Settings"** → **"Networking"** (or **"Deploy"** → **"Settings"**).
3. Under **"Public networking"** or **"Generate domain"**, click **"Generate Domain"**.
4. Copy the URL shown (e.g. `https://xxxxx.up.railway.app`).  
   **Do not add a slash at the end.**  
   This is your **API URL**. You will use it in the next step.

---

## Step 7: Connect the frontend to the API

1. On your computer, open the **frontend** folder:  
   **`biochar-bloom-main`** (inside your project).
2. In that folder, create or open a file named **`.env`** (same folder as `package.json`).
3. Add exactly this line, but **replace the URL** with the one you copied in Step 6:

```env
VITE_API_URL=https://your-copied-url.up.railway.app
```

Example (your URL will be different):

```env
VITE_API_URL=https://biochar-api-production-abc123.up.railway.app
```

4. Save the file.

---

## Step 8: Run the frontend and test

1. Open a terminal on your computer.
2. Go to the frontend folder:
   ```bash
   cd biochar-bloom-main
   ```
   (Or your full path, e.g. `cd /Users/hamsi/Documents/PROJECT_CHARA/S&R_MIGRATION/biochar-bloom-main`.)
3. Install dependencies if you haven’t:
   ```bash
   npm install
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open the URL shown (e.g. http://localhost:5173) in your browser.
6. **Sign up** with an email and password.
7. Then **Log in** with the same email and password.
8. If you see the dashboard and no errors, the frontend is talking to the Railway backend.

---

## Quick checklist

- [ ] **Step 1** – Railway project created  
- [ ] **Step 2** – PostgreSQL added  
- [ ] **Step 3** – API service added (from GitHub or empty)  
- [ ] **Step 4** – Root Directory = `backend`, Postgres dependency added, `JWT_SECRET` set  
- [ ] **Step 5** – Schema run once (Query tab or `psql`)  
- [ ] **Step 6** – Domain generated, API URL copied  
- [ ] **Step 7** – `.env` in `biochar-bloom-main` with `VITE_API_URL=...`  
- [ ] **Step 8** – `npm run dev`, sign up, log in, dashboard works  

---

## If something fails

- **"Database connection" or DATABASE_URL:**  
  In Step 4, make sure you added the **PostgreSQL** service as a dependency to the API service.

- **401 or "Invalid token" on login:**  
  Check that `VITE_API_URL` in `.env` is exactly the URL from Step 6 (no trailing slash). Restart the dev server after changing `.env` (`Ctrl+C`, then `npm run dev` again).

- **Tables don’t exist:**  
  Run Step 5 again with the full contents of `backend/database/schema.sql`.

- **API service won’t start:**  
  In Railway, open the API service → **Deployments** or **Logs** and read the error. Ensure Root Directory is `backend` and that `npm run build` and `npm start` work when you run them locally in the `backend` folder.

When you’re done with these 8 steps, your app will be using the Railway backend instead of Supabase.
