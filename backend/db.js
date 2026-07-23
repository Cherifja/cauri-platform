const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL manquant. En développement local, tu peux utiliser une base " +
      "Postgres locale ou un projet Supabase gratuit — voir DEPLOYMENT.md."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase et la plupart des hébergeurs gérés exigent SSL ; on l'active
  // sauf en local (DATABASE_URL contenant "localhost").
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
});

// Petit helper pour garder des appels concis dans server.js :
// query(text, params) -> Promise<rows[]>
async function query(text, params) {
  const result = await pool.query(text, params);
  return result.rows;
}

async function queryOne(text, params) {
  const rows = await query(text, params);
  return rows[0] || null;
}

module.exports = { pool, query, queryOne };
