import 'dotenv/config';
import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';

const pool = createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'social',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

export const db = drizzle(pool);

export async function checkDbConnection(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

export { pool };
