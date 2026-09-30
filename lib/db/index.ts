import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import postgres from "postgres";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";

// With DATABASE_URL set (CI, staging, production) we talk to real Postgres.
// Without it (local dev) we use PGlite, an embedded Postgres stored in .pglite/.
function createDb() {
  const url = process.env.DATABASE_URL;
  if (url) {
    return drizzlePostgres(postgres(url, { max: 5 }), { schema });
  }
  if (process.env.VERCEL) {
    // PGlite writes to local disk, which doesn't persist on Vercel. Fail loudly instead.
    throw new Error("DATABASE_URL must be set on Vercel deployments");
  }
  const client = new PGlite(process.env.PGLITE_DIR ?? ".pglite");
  return drizzlePglite(client, { schema }) as unknown as ReturnType<typeof drizzlePostgres<typeof schema>>;
}

type Db = ReturnType<typeof createDb>;

// Reuse one client across hot reloads in dev.
const globalForDb = globalThis as unknown as { db?: Db };
export const db: Db = globalForDb.db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export { schema };
