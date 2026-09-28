"use client";

import Button from "@/components/ui/Button";

// retry() re-fetches server data; reset() would just re-render the same failure.
export default function AppError({ retry }) {
  return (
    <div role="alert" className="card mx-auto max-w-md px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">Something boiled over</h1>
      <p className="mt-2 text-sm text-ink-muted">
        That page hit an error on our side. Trying again usually sorts it out.
      </p>
      <Button onClick={() => retry()} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
