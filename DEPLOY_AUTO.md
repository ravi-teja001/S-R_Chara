# Deploy automatically

## One command from your computer

From the **project root** (the folder that has `backend` and `biochar-bloom-main`), run:

```bash
cd "/Users/hamsi/Documents/PROJECT_CHARA/S&R_MIGRATION"
npm run deploy
```

If you're inside `biochar-bloom-main`, go up one folder first:

```bash
cd ..
npm run deploy
```

This will:

1. Build the backend  
2. Stage all changes (`git add -A`)  
3. Commit with message "Deploy to Railway"  
4. Push to GitHub (your current branch)

When the code is pushed, **Railway will auto-deploy** (if your Railway service is connected to this repo and the same branch).

---

## Before the first time

1. **Railway**: Your **S-R_Chara** service is connected to this GitHub repo and the correct branch (e.g. **main** or **Dev**).  
2. **Variables**: The service has **Postgres** as a reference (so `DATABASE_URL` exists) and **JWT_SECRET** set.  
3. **Git**: You’re in the repo root and your branch is pushed at least once (`git push -u origin main` or your branch name).

---

## After you run `npm run deploy`

- Check the **Railway** dashboard → your service → **Deployments** to see the new deployment.  
- When it’s **Success**, open **Settings → Networking → Generate Domain** (if you haven’t yet) and use that URL in your frontend **`.env`** as **VITE_API_URL=...**.
