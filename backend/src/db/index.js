import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool;

function createPoolConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required. Add it to backend/.env');
  }

  const url = new URL(databaseUrl);
  const sslMode = (url.searchParams.get('ssl-mode') || '').toUpperCase();

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: sslMode === 'REQUIRED' ? { rejectUnauthorized: false } : undefined,
    dateStrings: true,
  };
}

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(createPoolConfig());
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
