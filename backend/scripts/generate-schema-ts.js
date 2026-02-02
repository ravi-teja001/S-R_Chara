#!/usr/bin/env node
/**
 * Reads database/schema.sql and writes src/schemaSql.generated.ts
 * so the schema is embedded in the build (no file path at runtime).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const schemaPath = path.join(root, 'database', 'schema.sql');
const outPath = path.join(root, 'src', 'schemaSql.generated.ts');

const sql = fs.readFileSync(schemaPath, 'utf8');
const escaped = sql
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');
const content = `/** Auto-generated from database/schema.sql - do not edit */\nexport const schemaSql = \`${escaped}\`;\n`;

fs.writeFileSync(outPath, content, 'utf8');
console.log('Wrote src/schemaSql.generated.ts');
