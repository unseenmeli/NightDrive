import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <nav>
      <Link href="/">NightDrive</Link>
      {user ? (
        <>
          {" · "}
          <Link href="/submit">Submit a route</Link>
          {" · "}
          <Link href="/profile">{user.name}</Link>
          {user.role === "admin" && (
            <>
              {" · "}
              <Link href="/admin">Admin</Link>
            </>
          )}
          {" · "}
          <form action={logout} style={{ display: "inline" }}>
            <button type="submit">Log out</button>
          </form>
        </>
      ) : (
        <>
          {" · "}
          <Link href="/login">Log in</Link>
          {" · "}
          <Link href="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
