# Simple guide – get your backend online on Railway

**In one sentence:** We put your backend code (the `backend` folder) on Railway so your React app can talk to it instead of Supabase.

---

## What is "Root Directory"?

Your GitHub repo might look like this:

```
S-R_Chara (your repo)
├── backend          ← the API code (Node.js) is HERE
│   ├── package.json
│   ├── src/
│   └── database/
├── biochar-bloom-main   ← the React app (different folder)
└── ...
```

Railway needs to know: **"Which folder has the backend?"**

- If you don’t tell it, Railway uses the **top** of the repo (root). There is no `package.json` there, so the build fails.
- If you set **Root Directory** to **`backend`**, Railway uses the **backend** folder. That folder has `package.json`, so the build works.

So: **Root Directory = the folder where the backend code lives.** For you, that folder is named **`backend`**.

---

## What to do, step by step

### Step 1: Open your service in Railway

1. Go to **https://railway.app** and sign in.
2. Open your project (e.g. **ideal-rejoicing**).
3. Click on the service that is connected to GitHub (e.g. **S-R_Chara**).

---

### Step 2: Open Settings

1. At the top of that service you see tabs: **Deployments**, **Variables**, **Metrics**, **Settings**.
2. Click **Settings**.

---

### Step 3: Set Root Directory to `backend`

1. In Settings, find the **Source** section.
2. Look for something like **"Root Directory"** or **"Add Root Directory"**.
3. Click it (or the box next to it).
4. Type exactly: **backend**
5. Save (e.g. **Apply changes** or **Save**).

That’s it. Railway will now build and run from the `backend` folder.

---

### Step 4: Deploy

1. Click **Deploy** (or **Apply changes** and then Deploy).
2. Go to the **Deployments** tab.
3. Wait until the latest deployment shows **Success** (green). If it fails, the logs on that page will show the error.

---

### Step 5: Add database and secret (Variables)

1. Click the **Variables** tab.
2. **Connect to Postgres:**  
   Add a **reference** to your **Postgres** service (e.g. "Add reference" or "Connect" → choose Postgres).  
   Railway will add **DATABASE_URL** for you.
3. **Add JWT secret:**  
   Click **New variable** or **Add variable**.  
   - Name: **JWT_SECRET**  
   - Value: open Terminal on your Mac, run `openssl rand -base64 32`, copy the result, and paste it as the value.  
   Save.

After you add or change variables, Railway may redeploy once. Wait for that to finish.

---

### Step 6: Get your API URL

1. Stay in **Settings** (or go back to it).
2. Find **Networking** (or **Public networking**).
3. Click **Generate Domain**.
4. Copy the URL Railway shows (e.g. `https://something.up.railway.app`).  
   This is your **API URL**. No slash at the end.

---

### Step 7: Use that URL in your React app

1. On your computer, open your **frontend** project folder (e.g. **biochar-bloom-main**).
2. Create or open a file named **`.env`** in that folder (same folder as `package.json`).
3. Add one line (use the URL you copied):

```env
VITE_API_URL=https://your-copied-url.up.railway.app
```

4. Save the file.
5. Restart your React app (`npm run dev`). Now the app talks to your Railway backend.

---

## Short checklist

- [ ] Railway: open project → open **S-R_Chara** (or your API service).
- [ ] **Settings** → **Root Directory** = **backend** → Save.
- [ ] **Deploy** → wait until deployment is **Success**.
- [ ] **Variables** → add Postgres reference (DATABASE_URL) and **JWT_SECRET**.
- [ ] **Settings** → **Networking** → **Generate Domain** → copy URL.
- [ ] In **biochar-bloom-main**, in **`.env`**, set **VITE_API_URL=** that URL.
- [ ] Run **npm run dev** and test login/signup.

---

## If something is still unclear

Tell me exactly where you are stuck, for example:

- "I don’t see Root Directory"
- "I don’t know where to add the Postgres reference"
- "Deploy failed and I don’t understand the error"
- "I don’t know where to put the .env file"

Then I can tell you exactly what to click and what to type next.
