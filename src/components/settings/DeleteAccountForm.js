"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser } from "@/lib/auth-client";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";

export default function DeleteAccountForm() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    const { error } = await deleteUser({ password });
    if (error) {
      setPending(false);
      setError(
        error.code === "INVALID_PASSWORD"
          ? "That password isn't right."
          : error.status === 429
            ? "Too many attempts. Give it a minute and try again."
            : "Couldn't delete your account. Try again.",
      );
      return;
    }
    router.replace("/");
    router.refresh();
  }

  if (!confirming) {
    return (
      <div>
        <Button variant="danger" onClick={() => setConfirming(true)}>
          Delete my account
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      {error && <Alert>{error}</Alert>}
      {/* Password re-entry: a borrowed, unlocked laptop shouldn't be enough to wipe an account. */}
      <Field
        label="Enter your password to confirm"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoFocus
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => setConfirming(false)} disabled={pending}>
          Keep my account
        </Button>
        <Button type="submit" variant="danger" disabled={pending}>
          {pending ? "Deleting…" : "Delete everything for good"}
        </Button>
      </div>
    </form>
  );
}
