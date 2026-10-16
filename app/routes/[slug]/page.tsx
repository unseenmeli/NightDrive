import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedRoute } from "@/lib/routes";

export default async function RoutePage({ params }: PageProps<"/routes/[slug]">) {
  const { slug } = await params;
  const route = await getApprovedRoute(slug);
  if (!route) notFound();

  return (
    <main>
      <p>
        <Link href="/">← All routes</Link>
      </p>
      <h1>{route.title}</h1>
      <p>
        {route.startName} → {route.endName} · {route.region}
      </p>
      <ul>
        <li>Distance: {route.distanceKm} km</li>
        <li>Duration: ~{route.durationMin} min</li>
        <li>Scenery: {route.scenery}/10</li>
        <li>Road quality: {route.roadQuality}/10</li>
        <li>Difficulty: {route.difficulty}</li>
        {route.bestFor.length > 0 && <li>Best for: {route.bestFor.join(", ")}</li>}
        {route.bestTime && <li>Best time: {route.bestTime}</li>}
      </ul>
      <p>{route.description}</p>
      {route.notes && <p>Notes: {route.notes}</p>}

      {route.stops.length > 0 && (
        <>
          <h2>Stops</h2>
          <ul>
            {route.stops.map((stop) => (
              <li key={stop.name}>
                {stop.name} ({stop.type})
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
