import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db';
import { authMiddleware, optionalAuth } from './auth';
import stockPoints from './routes/stockPoints';
import plants from './routes/plants';
import vehicles from './routes/vehicles';
import rawBiomass from './routes/rawBiomass';
import expenses from './routes/expenses';
import processedBiomass from './routes/processedBiomass';
import biocharDeployment from './routes/biocharDeployment';
import auth from './routes/auth';
import { runSchemaIfNeeded } from './migrate';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'biochar-api' });
});

app.get('/health/db', async (_req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.json({
        ok: false,
        database: 'DATABASE_URL not set',
        app_users: false,
        hint: 'In Railway: S-R_Chara → Variables → add Postgres as dependency or set DATABASE_URL',
      });
    }
    const client = await pool.connect();
    let hasAppUsers = false;
    try {
      const r = await client.query(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_users' LIMIT 1`
      );
      hasAppUsers = r.rows.length > 0;
    } finally {
      client.release();
    }
    if (!hasAppUsers) {
      await runSchemaIfNeeded();
      const client2 = await pool.connect();
      try {
        const r2 = await client2.query(
          `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_users' LIMIT 1`
        );
        hasAppUsers = r2.rows.length > 0;
      } finally {
        client2.release();
      }
    }
    res.json({
      ok: hasAppUsers,
      database: 'connected',
      app_users: hasAppUsers,
      hint: hasAppUsers ? null : 'Schema apply failed. Check Railway logs for S-R_Chara.',
    });
  } catch (e: any) {
    res.json({
      ok: false,
      database: 'error',
      app_users: false,
      error: e?.message || 'Connection failed',
      hint: 'Check DATABASE_URL and that Postgres is running. In Railway: link Postgres to S-R_Chara.',
    });
  }
});

app.use('/api/auth', auth);

app.use('/api/stock-points', optionalAuth, stockPoints);
app.use('/api/plants', optionalAuth, plants);
app.use('/api/vehicles', authMiddleware, vehicles);
app.use('/api/raw-biomass-procurement', authMiddleware, rawBiomass);
app.use('/api/expenses', authMiddleware, expenses);
app.use('/api/processed-biomass-procurement', authMiddleware, processedBiomass);
app.use('/api/biochar-deployment', authMiddleware, biocharDeployment);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

async function start() {
  try {
    if (process.env.DATABASE_URL) {
      const client = await pool.connect();
      client.release();
      console.log('Database connected');
      await runSchemaIfNeeded();
    }
  } catch (e) {
    console.warn('Database connection failed:', (e as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`Biochar API running on port ${PORT}`);
  });
}

start();
