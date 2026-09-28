"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { sendJson } from "@/lib/send-json";

export default function DeleteRecipeButton({ id }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleDelete() {
    setPending(true);
    setFailed(false);
    const res = await sendJson(`/api/recipes/${id}`, "DELETE");
    // 404 means it's already gone, which is the outcome the user asked for.
    if (res.ok || res.status === 404) {
      router.push("/recipes");
      router.refresh();
      return;
    }
    setPending(false);
    setFailed(true);
  }

  if (!confirming) {
    return (
      <Button variant="danger" onClick={() => setConfirming(true)}>
        Delete
      </Button>
    );
  }

  return (
    <div role="group" aria-label="Confirm delete" className="flex items-center gap-2">
      <span className="text-sm text-ink-muted" aria-live="polite">
        {failed ? "Couldn't delete. Try again?" : "Delete for good?"}
      </span>
      {/* Focus the safe choice so a double Enter can't delete by accident. */}
      <Button variant="ghost" onClick={() => setConfirming(false)} disabled={pending} autoFocus>
        Keep it
      </Button>
      <Button onClick={handleDelete} disabled={pending}>
        {pending ? "Deleting…" : "Yes, delete"}
      </Button>
    </div>
  );
}
