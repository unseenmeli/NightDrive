import Link from "next/link";
import { notFound } from "next/navigation";
import { updateRoute } from "@/app/actions/admin";
import { RouteForm } from "@/components/RouteForm";
import { requireAdmin } from "@/lib/auth";
import { getRouteById } from "@/lib/routes";
import { routeToFormValues } from "@/lib/validation";

export default async function EditRoutePage({ params }: PageProps<"/admin/routes/[id]/edit">) {
  await requireAdmin();
  const id = Number((await params).id);
  const route = Number.isInteger(id) ? await getRouteById(id) : null;
  if (!route) notFound();

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin" className="inline-block font-mono text-xs tracking-[0.2em] uppercase">
        ← Admin
      </Link>
      <header>
        <p className="hud">Edit route</p>
        <h1 className="chrome mt-2 text-3xl italic">Edit: {route.title}</h1>
        <p className="mt-3 flex items-center gap-2 font-mono text-xs text-mist uppercase">
          Status: <span className={`chip chip-${route.status}`}>{route.status}</span>
        </p>
      </header>
      <RouteForm action={updateRoute.bind(null, route.id)} initialValues={routeToFormValues(route)} submitLabel="Save" />
    </main>
  );
}
