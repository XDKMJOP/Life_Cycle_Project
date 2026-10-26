import 'dotenv/config';
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'lifeplan',
  password: process.env.DB_PASSWORD ?? 'lifeplan',
  database: process.env.DB_NAME ?? 'lifeplan',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: '+07:00',
  charset: 'utf8mb4',
});
