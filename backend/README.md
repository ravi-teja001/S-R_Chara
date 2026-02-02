# Biochar API (Railway Backend)

Express + TypeScript REST API for the Biochar Management frontend. Replaces direct Supabase usage with a PostgreSQL-backed API deployable on Railway.

## Local setup

1. **Install dependencies**
   ```bash
   cd backend && npm install
   ```

2. **PostgreSQL**
   - Install PostgreSQL locally, or use Docker, or create a free Postgres on [Railway](https://railway.app) and copy `DATABASE_URL`.

3. **Environment**
   ```bash
   cp .env.example .env
   # Edit .env: set DATABASE_URL and JWT_SECRET
   ```

4. **Create tables**
   - Create a database, then run:
   ```bash
   psql $DATABASE_URL -f database/schema.sql
   ```

5. **Run**
   ```bash
   npm run dev
   ```
   API: `http://localhost:3000`

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/auth/login` | No | Login (email, password) → JWT + user |
| POST | `/api/auth/signup` | No | Sign up → JWT + user |
| POST | `/api/auth/logout` | No | Logout (no-op) |
| GET | `/api/stock-points` | Optional | List stock points |
| GET | `/api/plants` | Optional | List plants |
| GET/POST | `/api/vehicles` | Yes | List / create vehicles |
| PATCH/DELETE | `/api/vehicles/:id` | Yes | Update / delete vehicle |
| GET/POST | `/api/raw-biomass-procurement` | Yes | List / create raw procurement |
| GET/POST | `/api/expenses` | Yes | List / create expenses |
| GET/POST | `/api/processed-biomass-procurement` | Yes | List / create processed procurement |
| GET/POST | `/api/biochar-deployment` | Yes | List / create biochar deployment |

**Auth:** Send `Authorization: Bearer <jwt>` for protected routes. JWT is returned from `/api/auth/login` and `/api/auth/signup` in `session.access_token`.

## Deploy to Railway

See [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) in this folder.

## Environment (Railway)

- `DATABASE_URL` – Set automatically when you add Postgres to the project.
- `JWT_SECRET` – Set in Railway dashboard (Variables). Use a long random string in production.
- `PORT` – Set automatically by Railway.
