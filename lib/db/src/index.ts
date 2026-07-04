import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Supabase pooler uses a self-signed cert chain.
// Strip ?sslmode=* from the URL so pg-connection-string doesn't set its own
// ssl config that would override ours (which has rejectUnauthorized: false).
const rawUrl = process.env.DATABASE_URL;
const isSupabase = rawUrl.includes("supabase.com");
const connectionString = isSupabase
  ? rawUrl.replace(/([?&])sslmode=[^&]*/g, "$1").replace(/[?&]$/, "")
  : rawUrl;

export const pool = new Pool({
  connectionString,
  ssl: isSupabase ? { rejectUnauthorized: false } : false,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
