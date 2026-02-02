# Web not loading – what to try

## 1. Run the dev server and use the right URL

The app runs on **port 8080** (not 5173).

```bash
cd biochar-bloom-main
npm run dev
```

Then in your browser open: **http://localhost:8080**

(If it says a different port in the terminal, use that one.)

---

## 2. Check the browser

- **Blank / white screen:** Open **Developer Tools** (F12 or right‑click → Inspect) → **Console** tab. Note any red errors and search for them or share them.
- **“This site can’t be reached”:** The dev server is probably not running. Run `npm run dev` again from `biochar-bloom-main`.

---

## 3. If you’re using the Railway API (VITE_API_URL)

- **Check the API is up:** In the browser open:
  ```
  https://YOUR-RAILWAY-URL.up.railway.app/health
  ```
  You should see something like: `{"ok":true,"service":"biochar-api"}`. If the page doesn’t load, the API is down or the URL is wrong.

- **Check `.env`:** In `biochar-bloom-main` you should have:
  ```
  VITE_API_URL=https://YOUR-RAILWAY-URL.up.railway.app
  ```
  No slash at the end. No quotes.

- **Restart after changing `.env`:** Stop the dev server (Ctrl+C), then run `npm run dev` again. Vite only reads `.env` at startup.

---

## 4. If the app loads but login doesn’t work

- Open **Developer Tools** → **Network** tab → try to log in. See if any request is red (failed). Check the **Console** for errors.
- Confirm **VITE_API_URL** in `.env` is exactly the Railway URL and that **/health** opens in the browser (step 3).

---

## Quick checklist

- [ ] `npm run dev` is running from `biochar-bloom-main`
- [ ] Opened **http://localhost:8080** (or the port shown in the terminal)
- [ ] If using Railway: **/health** opens in the browser and returns JSON
- [ ] If using Railway: **.env** has **VITE_API_URL=...** and you restarted `npm run dev` after editing it
- [ ] Console (F12) has no red errors (or note what they say)
