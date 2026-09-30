import Link from "next/link";
import { connection } from "next/server";
import { listApprovedRoutes } from "@/lib/routes";

export default async function HomePage() {
  await connection(); // render per request, never at build time
  const routes = await listApprovedRoutes();

  return (
    <main>
      <h1>NightDrive</h1>
      <p>Discover and plan scenic night drives.</p>

      <h2>Routes</h2>
      <ul>
        {routes.map((route) => (
          <li key={route.id}>
            <Link href={`/routes/${route.slug}`}>{route.title}</Link> · {route.region} ·{" "}
            {route.distanceKm} km · scenery {route.scenery}/10
          </li>
        ))}
      </ul>
    </main>
  );
}
