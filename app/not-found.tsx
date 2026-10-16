import Link from "next/link";

export default function NotFound() {
  return (
    <main className="py-24 text-center">
      <p className="hud">Error 404</p>
      <h1 className="chrome mt-4 text-5xl italic sm:text-6xl">Road closed</h1>
      <p className="mx-auto mt-4 max-w-md text-mist">This route doesn&apos;t exist, or it hasn&apos;t been approved yet.</p>
      <Link href="/" className="btn mt-8">
        Back to routes
      </Link>
    </main>
  );
}
