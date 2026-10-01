"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendJson } from "@/lib/send-json";

const UNDO_MS = 5000;

// Removing an entry waits UNDO_MS before calling the API, so Undo never has
// to recreate a deleted snapshot. If the page goes away inside that window,
// the delete is sent anyway (keepalive) because that's what the user asked for.
export default function DeleteLogButton({ id, name }) {
  const router = useRouter();
  const [state, setState] = useState("idle"); // idle | removing | failed
  const timer = useRef(null);
  const deleteRef = useRef(null);
  const undoRef = useRef(null);
  const url = `/api/logs/${id}`;

  async function remove() {
    timer.current = null;
    const res = await sendJson(url, "DELETE");
    // 404 means it's already gone, which is the outcome the user asked for.
    if (res.ok || res.status === 404) router.refresh();
    else setState("failed");
  }

  function start() {
    setState("removing");
    timer.current = setTimeout(remove, UNDO_MS);
  }

  function undo() {
    clearTimeout(timer.current);
    timer.current = null;
    setState("idle");
  }

  useEffect(() => {
    if (state !== "removing") return;
    undoRef.current?.focus();

    const flush = () => {
      if (!timer.current) return;
      clearTimeout(timer.current);
      timer.current = null;
      fetch(url, { method: "DELETE", keepalive: true });
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush(); // navigated away inside the Undo window
    };
  }, [state, url]);

  // Keep keyboard focus in the row after Undo.
  const wasRemoving = useRef(false);
  useEffect(() => {
    if (state === "idle" && wasRemoving.current) deleteRef.current?.focus();
    wasRemoving.current = state === "removing";
  }, [state]);

  const status =
    state === "removing"
      ? `Removed ${name} from the log.`
      : state === "failed"
        ? `Couldn't remove ${name}.`
        : "";

  return (
    <>
      <span className="sr-only" aria-live="polite">
        {status}
      </span>
      {state === "idle" && (
        <button
          ref={deleteRef}
          type="button"
          onClick={start}
          aria-label={`Remove ${name} from log`}
          className="grid size-8 shrink-0 place-items-center rounded-md text-ink-muted/70 transition-colors hover:bg-cream-dark hover:text-terracotta-dark"
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
      )}
      {state === "removing" && (
        <button
          ref={undoRef}
          type="button"
          data-removing
          onClick={undo}
          aria-label={`Undo removing ${name}`}
          className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-terracotta-deep underline underline-offset-2 hover:bg-cream-dark"
        >
          Undo
        </button>
      )}
      {state === "failed" && (
        <span className="flex shrink-0 items-center gap-1 text-sm text-terracotta-dark">
          Couldn&apos;t remove
          <button
            type="button"
            onClick={start}
            className="rounded-md px-1.5 py-1 font-medium underline underline-offset-2 hover:bg-cream-dark"
          >
            Retry
          </button>
        </span>
      )}
    </>
  );
}
