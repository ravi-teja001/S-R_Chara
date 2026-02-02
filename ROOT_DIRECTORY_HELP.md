# I don't see Root Directory – what to do

## Option 1: You don't need it anymore (easiest)

A **package.json** was added at the **root** of your project (same folder as `backend` and `biochar-bloom-main`). It tells Railway to build and run the **backend** folder.

So you **do not need to set Root Directory**. Just:

1. Push your code to GitHub (including the new root `package.json`).
2. In Railway, open your **S-R_Chara** service and click **Deploy** (or let it auto-deploy).
3. Railway will use the repo root, run `npm run build` (which runs `cd backend && npm ci && npm run build`) and `npm start` (which runs `cd backend && npm start`).

Leave **Root Directory** empty (or don't look for it). Deploy and check **Deployments** for build logs.

---

## Option 2: Where Root Directory is (if you still want to set it)

Railway sometimes hides it or uses different wording. Try this:

1. Click your service (**S-R_Chara**).
2. Click the **Settings** tab.
3. On the **right side** of the page there is often a list of sections: **Source**, **Networking**, **Scale**, **Build**, **Deploy**, etc.
   - Click **Source**.
   - In the **Source** section, look for:
     - **Root Directory**, or
     - A link like **"Add Root Directory"** or **"Set root directory"**.
4. If you don't see a list on the right, **scroll down** the main Settings area. The **Source** section (with repo and branch) may be at the top; **Root Directory** can be just below the repo URL, sometimes as a small link: **"Add Root Directory"**.
5. If you see **Source Repo** and the GitHub URL, look **directly under** that line for a link such as **"Add Root Directory (used for build and deploy steps)"** and click it. Then type **backend**.

---

## Summary

- **Easiest:** Use **Option 1**. Push the new root `package.json`, deploy, and don't set Root Directory.
- **If you prefer the UI:** Use **Option 2** and look under **Settings → Source** for **"Add Root Directory"** or **Root Directory**, then set it to **backend**.
