import mysql, { Pool } from 'mysql2/promise';

const globalDatabase = globalThis as typeof globalThis & { irDatabase?: Pool };

export function database(): Pool {
  if (!globalDatabase.irDatabase) {
    for (const key of ['DB_NAME', 'DB_USER', 'DB_PASSWORD']) {
      if (!process.env[key]) throw new Error(`Server database configuration missing: ${key}`);
    }
    globalDatabase.irDatabase = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      charset: 'utf8mb4',
      timezone: 'Z',
      dateStrings: true,
      connectionLimit: 8,
      maxIdle: 4,
      idleTimeout: 60000,
      waitForConnections: true,
      queueLimit: 64,
      enableKeepAlive: true,
      multipleStatements: false,
    });
  }
  return globalDatabase.irDatabase;
}
