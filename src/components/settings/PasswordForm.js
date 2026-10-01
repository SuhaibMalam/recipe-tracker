"use client";

import { useState } from "react";
import { changePassword } from "@/lib/auth-client";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";

const empty = { currentPassword: "", newPassword: "" };

function describe(error) {
  if (error.status === 429) return "Too many attempts. Give it a minute and try again.";
  if (error.code === "INVALID_PASSWORD") return "Your current password isn't right.";
  if (error.code === "PASSWORD_TOO_SHORT") return "Use at least 8 characters.";
  if (error.code === "PASSWORD_TOO_LONG") return "That password is too long.";
  return "Couldn't change your password. Try again.";
}

export default function PasswordForm() {
  const [fields, setFields] = useState(empty);
  const [status, setStatus] = useState({ tone: "idle", message: "" });

  const setField = (e) => setFields((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ tone: "pending", message: "" });
    const { error } = await changePassword({ ...fields, revokeOtherSessions: true });
    if (error) {
      setStatus({ tone: "error", message: describe(error) });
      return;
    }
    setFields(empty);
    setStatus({
      tone: "done",
      message: "Password changed. Any other devices you were signed in on have been signed out.",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      {status.tone === "error" && <Alert>{status.message}</Alert>}
      {status.tone === "done" && <Alert tone="success">{status.message}</Alert>}
      <Field
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        value={fields.currentPassword}
        onChange={setField}
        required
      />
      <Field
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        value={fields.newPassword}
        onChange={setField}
        required
        minLength={8}
        hint="At least 8 characters."
      />
      <div>
        <Button type="submit" disabled={status.tone === "pending"}>
          {status.tone === "pending" ? "Changing…" : "Change password"}
        </Button>
      </div>
    </form>
  );
}
