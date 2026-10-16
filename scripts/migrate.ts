import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { PGlite } from "@electric-sql/pglite";
import postgres from "postgres";

const migrationsFolder = "./drizzle";

async function main() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const client = postgres(url, { max: 1 });
    await migratePostgres(drizzlePostgres(client), { migrationsFolder });
    await client.end();
    console.log("Migrations applied (postgres)");
  } else {
    const client = new PGlite(process.env.PGLITE_DIR ?? ".pglite");
    await migratePglite(drizzlePglite(client), { migrationsFolder });
    await client.close();
    console.log("Migrations applied (pglite)");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
