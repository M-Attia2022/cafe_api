import { Pool } from "pg";
const g = globalThis;
export const pool = g._pgPool || (g._pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
}));
export const q = (text, params) => pool.query(text, params).then((r) => r.rows);
