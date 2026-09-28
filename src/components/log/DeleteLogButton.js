"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendJson } from "@/lib/send-json";

export default function DeleteLogButton({ id, name }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const res = await sendJson(`/api/logs/${id}`, "DELETE");
    if (res.ok || res.status === 404) router.refresh();
    else setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={`Remove ${name} from log`}
      className="grid size-8 shrink-0 place-items-center rounded-md text-ink-muted/70 transition-colors hover:bg-cream-dark hover:text-terracotta-dark disabled:opacity-40"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M5 5l10 10M15 5L5 15" />
      </svg>
    </button>
  );
}
