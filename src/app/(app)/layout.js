import Link from "next/link";
import { requireUser } from "@/lib/session";
import { SITE_NAME } from "@/lib/site";
import NavLink from "@/components/NavLink";
import SignOutButton from "@/components/SignOutButton";
import TimezoneSync from "@/components/TimezoneSync";

export default async function AppLayout({ children }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <TimezoneSync />
      <a
        href="#main"
        className="sr-only z-30 rounded-md bg-ink px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
        {/* Phones: brand + sign out on row one, nav wraps to its own row. */}
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:h-16 sm:flex-nowrap sm:px-6 sm:py-0">
          <Link
            href="/dashboard"
            className="font-serif text-xl font-semibold tracking-tight text-ink"
          >
            {SITE_NAME}
          </Link>
          <nav
            aria-label="Main"
            className="order-last -ml-3 flex w-full gap-1 sm:order-none sm:ml-0 sm:w-auto"
          >
            <NavLink href="/dashboard">Overview</NavLink>
            <NavLink href="/recipes">Recipes</NavLink>
            <NavLink href="/log">Food log</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-ink-muted sm:block">{user.name}</span>
            <NavLink href="/settings">Settings</NavLink>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="focus:outline-none mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6"
      >
        {children}
      </main>
    </div>
  );
}
