import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listRoutesByUser } from "@/lib/routes";

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const user = await requireUser();
  const { submitted } = await searchParams;
  const routes = await listRoutesByUser(user.id);

  return (
    <main className="mx-auto max-w-3xl space-y-8">
      <header className="panel flex items-center gap-5 p-6">
        <div className="grid size-14 shrink-0 place-items-center border border-neon/50 bg-neon/10 font-display text-2xl text-neon">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="hud">Driver profile</p>
          <h1 className="mt-1 text-2xl italic">{user.name}</h1>
          <p className="font-mono text-sm text-mist">{user.email}</p>
        </div>
      </header>

      {submitted && (
        <p role="status" className="panel border-go/50 px-5 py-3 font-mono text-sm text-go">
          Thanks! Your route was submitted for review.
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-xl italic">My submissions</h2>
        {routes.length === 0 ? (
          <p className="text-mist">
            You haven&apos;t submitted any routes yet. <Link href="/submit">Submit one</Link>.
          </p>
        ) : (
          <ul className="space-y-2">
            {routes.map((route) => (
              <li key={route.id} className="panel flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3">
                <span className="mr-auto">
                  {route.status === "approved" ? (
                    <Link href={`/routes/${route.slug}`}>{route.title}</Link>
                  ) : (
                    <span className="text-white">{route.title}</span>
                  )}
                </span>
                <span className={`chip chip-${route.status}`}>{route.status}</span>
                {route.status === "rejected" && route.rejectReason && (
                  <span className="w-full font-mono text-xs text-stop/80">Reason: {route.rejectReason}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
