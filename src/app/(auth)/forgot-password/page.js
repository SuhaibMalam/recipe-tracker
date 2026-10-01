"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-client";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ tone: "idle", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ tone: "pending", message: "" });
    const { error } = await requestPasswordReset({ email, redirectTo: "/reset-password" });

    if (error) {
      setStatus({
        tone: "error",
        message:
          error.status === 429
            ? "Too many requests. Wait a few minutes and try again."
            : "Couldn't send the email. Try again.",
      });
      return;
    }
    // Same message whether or not the address has an account, so this page
    // can't be used to find out who's registered.
    setStatus({
      tone: "done",
      message: `If ${email} has an account, a reset link is on its way. It works for one hour.`,
    });
  }

  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">Forgot your password?</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Enter your email and we&apos;ll send you a link to choose a new one.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        {status.tone === "error" && <Alert>{status.message}</Alert>}
        {status.tone === "done" && <Alert tone="success">{status.message}</Alert>}

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" disabled={status.tone === "pending"} className="mt-1 w-full">
          {status.tone === "pending" ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-ink-muted">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-terracotta-deep underline decoration-terracotta/40 underline-offset-4 hover:decoration-terracotta-deep"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}
