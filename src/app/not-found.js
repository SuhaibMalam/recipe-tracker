import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-serif text-6xl text-terracotta">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Not in the recipe box</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        This page doesn&apos;t exist, or it belongs to someone else&apos;s kitchen.
      </p>
      <Link href="/dashboard" className={buttonClasses("primary", "mt-6")}>
        Back to your overview
      </Link>
    </main>
  );
}
