import Link from "next/link";
import { approveRoute, deleteRoute, rejectRoute } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { listAllRoutes } from "@/lib/routes";

export default async function AdminPage() {
  await requireAdmin();
  const rows = await listAllRoutes();
  const pending = rows.filter((r) => r.route.status === "pending");

  return (
    <main>
      <h1>Admin</h1>

      <h2>Pending review ({pending.length})</h2>
      {pending.length === 0 ? (
        <p>Nothing to review.</p>
      ) : (
        <ul>
          {pending.map(({ route, submitter }) => (
            <li key={route.id} data-testid={`pending-${route.slug}`}>
              <strong>{route.title}</strong> · {route.region} · {route.distanceKm} km · by {submitter ?? "unknown"}{" "}
              · <Link href={`/admin/routes/${route.id}/edit`}>Edit</Link>
              <p>{route.description}</p>
              <form action={approveRoute} style={{ display: "inline" }}>
                <input type="hidden" name="id" value={route.id} />
                <button type="submit">Approve</button>
              </form>{" "}
              <form action={rejectRoute} style={{ display: "inline" }}>
                <input type="hidden" name="id" value={route.id} />
                <input name="reason" placeholder="Reason (optional)" aria-label="Reject reason" />
                <button type="submit">Reject</button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2>All routes ({rows.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Submitted by</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ route, submitter }) => (
            <tr key={route.id}>
              <td>
                {route.status === "approved" ? <Link href={`/routes/${route.slug}`}>{route.title}</Link> : route.title}
              </td>
              <td>{route.status}</td>
              <td>{submitter ?? "seed"}</td>
              <td>
                <Link href={`/admin/routes/${route.id}/edit`}>Edit</Link>{" "}
                <form action={deleteRoute} style={{ display: "inline" }}>
                  <input type="hidden" name="id" value={route.id} />
                  <button type="submit">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
