# Using the Railway Backend (Frontend)

When Supabase is not working, you can run the app against the **Railway API** backend.

## 1. Deploy the backend

Deploy the API and Postgres to Railway using the instructions in:

**`../backend/RAILWAY_DEPLOY.md`**

After deployment you will have a URL like: `https://your-api.up.railway.app`

## 2. Point the frontend to Railway

In the frontend project (`biochar-bloom-main`), set the API base URL:

**`.env` or `.env.production`:**

```env
VITE_API_URL=https://your-api.up.railway.app
```

Do **not** add a trailing slash. Leave `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` unset (or remove them) so the app uses the Railway API.

## 3. Run the app

- **Development:** `npm run dev` — the app will call `${VITE_API_URL}/api/...` for auth and data.
- **Production:** Build with the same env; the built app will use the Railway API.

## 4. Auth and data

- **Login / Signup** go to `POST /api/auth/login` and `POST /api/auth/signup`. The backend returns a JWT and user; the app stores them and sends `Authorization: Bearer <token>` on every API request.
- **Data** (stock points, vehicles, procurement, expenses, etc.) is served by the same Railway API. The existing `api.ts` layer automatically uses the Railway client when `VITE_API_URL` is set.

No code changes are needed beyond setting `VITE_API_URL`; auth and API selection are handled in `AuthContext` and `api.ts`.

## 5. Password reset

Password reset is not implemented on the Railway backend. The “Forgot password” flow will show a message that reset is not available. You can add a reset endpoint to the backend later if needed.
