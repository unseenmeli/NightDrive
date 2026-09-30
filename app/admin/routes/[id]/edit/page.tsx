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
    <main>
      <p>
        <Link href="/admin">← Admin</Link>
      </p>
      <h1>Edit: {route.title}</h1>
      <p>Status: {route.status}</p>
      <RouteForm action={updateRoute.bind(null, route.id)} initialValues={routeToFormValues(route)} submitLabel="Save" />
    </main>
  );
}
