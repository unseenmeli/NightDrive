import Link from "next/link";
import { approveRoute, deleteRoute, rejectRoute } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { listAllRoutes } from "@/lib/routes";

export default async function AdminPage() {
  await requireAdmin();
  const rows = await listAllRoutes();
  const pending = rows.filter((r) => r.route.status === "pending");

  return (
    <main className="space-y-10">
      <header>
        <p className="hud">Control room</p>
        <h1 className="chrome mt-2 text-4xl italic">Admin</h1>
      </header>

      <section className="space-y-4">
        <h2 className="flex items-baseline gap-3 text-xl italic">
          Pending review
          <span className="font-mono text-sm text-sodium not-italic">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <p className="panel p-6 font-mono text-sm text-mist">Nothing to review. All quiet on the road.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map(({ route, submitter }) => (
              <li key={route.id} data-testid={`pending-${route.slug}`} className="panel space-y-3 p-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <strong className="font-display text-white italic">{route.title}</strong>
                  <span className="font-mono text-xs text-mist">
                    {route.region} · {route.distanceKm} km · by {submitter ?? "unknown"}
                  </span>
                  <Link href={`/admin/routes/${route.id}/edit`} className="ml-auto font-mono text-xs tracking-[0.2em] uppercase">
                    Edit
                  </Link>
                </div>
                <p className="text-sm text-fog/90">{route.description}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <form action={approveRoute}>
                    <input type="hidden" name="id" value={route.id} />
                    <button type="submit" className="btn btn-go">
                      Approve
                    </button>
                  </form>
                  <form action={rejectRoute} className="flex flex-1 items-center gap-3">
                    <input type="hidden" name="id" value={route.id} />
                    <input name="reason" placeholder="Reason (optional)" aria-label="Reject reason" className="max-w-xs" />
                    <button type="submit" className="btn btn-danger">
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="flex items-baseline gap-3 text-xl italic">
          All routes
          <span className="font-mono text-sm text-neon not-italic">({rows.length})</span>
        </h2>
        <div className="panel overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line font-mono text-[0.65rem] tracking-[0.2em] text-mist uppercase">
              <tr>
                <th className="px-5 py-3 font-normal">Title</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 font-normal">Submitted by</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {rows.map(({ route, submitter }) => (
                <tr key={route.id} className="transition hover:bg-neon/5">
                  <td className="px-5 py-3">
                    {route.status === "approved" ? (
                      <Link href={`/routes/${route.slug}`}>{route.title}</Link>
                    ) : (
                      <span className="text-white">{route.title}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`chip chip-${route.status}`}>{route.status}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-mist">{submitter ?? "seed"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link href={`/admin/routes/${route.id}/edit`} className="font-mono text-xs tracking-[0.2em] uppercase">
                        Edit
                      </Link>
                      <form action={deleteRoute}>
                        <input type="hidden" name="id" value={route.id} />
                        <button
                          type="submit"
                          className="cursor-pointer font-mono text-xs tracking-[0.2em] text-stop/80 uppercase hover:text-stop"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
