#!/usr/bin/env node
/**
 * Run database/schema.sql against DATABASE_URL.
 * No psql needed. Usage:
 *   DATABASE_URL="postgresql://..." node scripts/run-schema.js
 * Or from backend folder with .env: node scripts/run-schema.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Missing DATABASE_URL. Set it in .env or:');
  console.error('  DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require" node scripts/run-schema.js');
  process.exit(1);
}

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const sql = fs.readFileSync(schemaPath, 'utf8');

// Split into single statements (pg doesn't accept multiple in one query)
const statements = sql
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith('--'));

async function run() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('railway') ? { rejectUnauthorized: false } : undefined,
  });
  try {
    await client.connect();
    for (const stmt of statements) {
      if (stmt) await client.query(stmt + ';');
    }
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
