/**
 * Run schema automatically on startup if tables don't exist (e.g. first deploy on Railway).
 */

import { pool } from './db';
import fs from 'fs';
import path from 'path';

// Schema is copied to dist/schema.sql during build so deploy always has it
const SCHEMA_IN_DIST = path.join(__dirname, 'schema.sql');
const SCHEMA_IN_SOURCE = path.join(__dirname, '..', 'database', 'schema.sql');

function getSchemaPath(): string | null {
  if (fs.existsSync(SCHEMA_IN_DIST)) return SCHEMA_IN_DIST;
  if (fs.existsSync(SCHEMA_IN_SOURCE)) return SCHEMA_IN_SOURCE;
  const inCwd = path.join(process.cwd(), 'database', 'schema.sql');
  if (fs.existsSync(inCwd)) return inCwd;
  return null;
}

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

    const schemaPath = getSchemaPath();
    if (!schemaPath) {
      console.warn('schema.sql not found (tried dist/, database/, cwd)');
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
