import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listRoutesByUser } from "@/lib/routes";

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const user = await requireUser();
  const { submitted } = await searchParams;
  const routes = await listRoutesByUser(user.id);

  return (
    <main>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {submitted && <p role="status">Thanks! Your route was submitted for review.</p>}

      <h2>My submissions</h2>
      {routes.length === 0 ? (
        <p>
          You haven&apos;t submitted any routes yet. <Link href="/submit">Submit one</Link>.
        </p>
      ) : (
        <ul>
          {routes.map((route) => (
            <li key={route.id}>
              {route.status === "approved" ? (
                <Link href={`/routes/${route.slug}`}>{route.title}</Link>
              ) : (
                route.title
              )}{" "}
              · <strong>{route.status}</strong>
              {route.status === "rejected" && route.rejectReason && <> · Reason: {route.rejectReason}</>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
