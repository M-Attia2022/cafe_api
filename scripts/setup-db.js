// Usage: DATABASE_URL=... node scripts/setup-db.js   (creates tables + seed)
const { Client } = require("pg");
const fs = require("fs");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query(fs.readFileSync(__dirname + "/../schema.sql", "utf8"));
  await c.end();
  console.log("Database ready ✅");
})().catch((e) => { console.error(e); process.exit(1); });
