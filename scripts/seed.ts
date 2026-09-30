import { db, schema } from "../lib/db";
import { seedRoutes } from "../lib/db/seed-data";
import { hashPassword } from "../lib/password";

// Idempotent: existing rows are left alone, so this is safe to run on every deploy.
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const created = await db
      .insert(schema.users)
      .values({ email, name: "Admin", role: "admin", passwordHash: await hashPassword(password) })
      .onConflictDoNothing({ target: schema.users.email })
      .returning({ id: schema.users.id });
    console.log(created.length ? `Created admin ${email}` : `Admin ${email} already exists`);
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin user");
  }

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
