/**
 * Run schema automatically on startup if tables don't exist (e.g. first deploy on Railway).
 */

import { pool } from './db';
import fs from 'fs';
import path from 'path';

export async function runSchemaIfNeeded(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;

  const client = await pool.connect();
  try {
    const r = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_users' LIMIT 1`
    );
    if (r.rows.length > 0) {
      console.log('Database already has tables, skipping schema.');
      return;
    }

    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.warn('schema.sql not found at', schemaPath);
      return;
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      if (stmt) await client.query(stmt + ';');
    }
    console.log('Schema applied automatically (first run).');
  } catch (e) {
    console.error('Auto schema failed:', (e as Error).message);
  } finally {
    client.release();
  }
}
