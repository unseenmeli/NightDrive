import { submitRoute } from "@/app/actions/routes";
import { RouteForm } from "@/components/RouteForm";
import { requireUser } from "@/lib/auth";

export default async function SubmitPage() {
  await requireUser();

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="hud">New transmission</p>
        <h1 className="chrome mt-2 text-4xl italic">Submit a route</h1>
        <p className="mt-3 text-mist">Submitted routes are reviewed by an admin before they appear publicly.</p>
      </header>
      <RouteForm action={submitRoute} submitLabel="Submit for review" />
    </main>
  );
}
