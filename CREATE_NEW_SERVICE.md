# Create a new API service (efficient-happiness is offline)

You can add a **new** API service in the **same** project (your Postgres stays; no need to create a new project).

---

## Option A: Add a new service in the same project

1. In Railway, open your project **ideal-rejoicing** (where Postgres is already Online).

2. Click **"+ New"** (top right or in the sidebar).

3. Click **"GitHub Repo"**.
   - If your code is **not** on GitHub yet, push it first, then come back and choose **"GitHub Repo"**.
   - Select the repo that contains the **backend** folder (e.g. S&R_MIGRATION or your biochar repo).

4. A **new service** is created (it might get a random name like "brave-morning"). Click on it.

5. **Settings** tab:
   - **Root Directory:** set to **`backend`**.
   - **Build Command:** `npm run build` (or leave default).
   - **Start Command:** `npm start` (or leave default).

6. **Variables** tab:
   - **Add reference / Connect to Postgres:** choose your **Postgres** service.  
     This adds `DATABASE_URL` automatically.
   - **Add variable:**  
     Name: `JWT_SECRET`  
     Value: run in terminal `openssl rand -base64 32` and paste the result.

7. Click **Deploy** (or wait for auto-deploy).  
   Open **Deployments** to see build logs. If it fails, check the error there.

8. When the deployment is **successful**, go to **Settings → Networking** → **Generate Domain** and copy the URL for your frontend `.env` (`VITE_API_URL=...`).

---

## Option B: Fix the current "efficient-happiness" service

Before creating a new one, you can see why the current one stays offline:

1. Click **efficient-happiness**.
2. Open the **Deployments** tab.
3. Click the latest deployment (if any) and check the **build logs** and **deploy logs**.
   - **Build failed:** often missing repo, wrong Root Directory, or wrong build command. Fix in Settings (Root Directory = `backend`, Build = `npm run build`).
   - **No deployment at all:** the service might not be connected to a repo. In **Settings → Source**, click **Connect Repo** and select your repo.

If you prefer to start clean, use **Option A** and you can ignore or delete **efficient-happiness** later.
