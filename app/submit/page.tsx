import { submitRoute } from "@/app/actions/routes";
import { RouteForm } from "@/components/RouteForm";
import { requireUser } from "@/lib/auth";

export default async function SubmitPage() {
  await requireUser();

  return (
    <main>
      <h1>Submit a route</h1>
      <p>Submitted routes are reviewed by an admin before they appear publicly.</p>
      <RouteForm action={submitRoute} submitLabel="Submit for review" />
    </main>
  );
}
