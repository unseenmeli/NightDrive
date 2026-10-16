import type { ReactNode } from "react";

// Centered "access terminal" card shared by the login and register pages.
export function AuthShell({ caption, title, children }: { caption: string; title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-md py-10">
      <div className="panel space-y-6 p-8">
        <div>
          <p className="hud">{caption}</p>
          <h1 className="chrome mt-2 text-3xl italic">{title}</h1>
        </div>
        {children}
      </div>
    </main>
  );
}
