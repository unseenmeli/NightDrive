import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";

// Same box for links and the logout button, so they line up on one row.
const linkClass =
  "inline-flex items-center font-mono text-xs leading-none tracking-[0.2em] uppercase text-mist hover:text-neon hover:[text-shadow:0_0_10px_var(--color-neon)]";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-night/80 backdrop-blur-md">
      <div className="h-px bg-linear-to-r from-transparent via-neon/70 to-transparent" />
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="mr-auto font-display text-lg tracking-wider text-white italic hover:text-white">
          <span className="chrome">NIGHT</span>
          <span className="text-neon [text-shadow:0_0_12px_var(--color-neon)]">DRIVE</span>
        </Link>
        {/* Logged in there are four links, so on phones they get their own row under the logo */}
        <div
          className={`flex items-center gap-x-6 ${user ? "w-full justify-between sm:w-auto sm:justify-end" : ""}`}
        >
          {user ? (
            <>
              <Link href="/submit" className={linkClass}>
                Submit a route
              </Link>
              <Link href="/profile" className={linkClass}>
                {user.name}
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className={`${linkClass} text-sodium`}>
                  Admin
                </Link>
              )}
              <form action={logout} className="flex">
                <button type="submit" className={`${linkClass} cursor-pointer`}>
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass}>
                Log in
              </Link>
              <Link href="/register" className="btn px-4 py-1.5 text-[0.65rem] text-night hover:text-night">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
