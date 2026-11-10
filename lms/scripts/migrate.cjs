const fs = require('node:fs/promises');
const path = require('node:path');
const mysql = require('mysql2/promise');
require('@next/env').loadEnvConfig(process.cwd());

(async () => {
  for (const key of ['DB_NAME', 'DB_USER', 'DB_PASSWORD']) {
    if (!process.env[key]) throw new Error(`Missing ${key}`);
  }
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4',
    multipleStatements: true,
  });
  try {
    await connection.query('CREATE TABLE IF NOT EXISTS ir_schema_migrations (name VARCHAR(200) NOT NULL PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    const directory = path.join(process.cwd(), 'migrations');
    const files = (await fs.readdir(directory)).filter(name => /^\d+.*\.sql$/.test(name)).sort();
    for (const name of files) {
      const [applied] = await connection.execute('SELECT name FROM ir_schema_migrations WHERE name = ?', [name]);
      if (applied.length) continue;
      await connection.query(await fs.readFile(path.join(directory, name), 'utf8'));
      await connection.execute('INSERT INTO ir_schema_migrations (name) VALUES (?)', [name]);
      console.log(`Applied ${name}`);
    }
    console.log('Database migrations are up to date. No course or user seeds were added.');
  } finally {
    await connection.end();
  }
})().catch(error => {
  console.error('Migration failed:', error.code || error.message);
  process.exitCode = 1;
});
