import { db, schema } from "../lib/db";
import { seedRoutes } from "../lib/db/seed-data";

// Idempotent: existing slugs are left alone, so this is safe to run on every deploy.
async function main() {
  const inserted = await db
    .insert(schema.routes)
    .values(seedRoutes.map((r) => ({ ...r, status: "approved" as const })))
    .onConflictDoNothing({ target: schema.routes.slug })
    .returning({ slug: schema.routes.slug });
  console.log(`Seeded ${inserted.length} new route(s)`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
