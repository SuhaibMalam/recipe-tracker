"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-client";
import Alert from "@/components/ui/Alert";
import Button, { buttonClasses } from "@/components/ui/Button";
import Field from "@/components/ui/Field";

const linkClasses =
  "font-medium text-terracotta-deep underline decoration-terracotta/40 underline-offset-4 hover:decoration-terracotta-deep";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

// The emailed link goes through Better Auth, which checks the token and sends
// the user here with ?token=… (valid) or ?error=INVALID_TOKEN (expired/used).
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ tone: "idle", message: "" });

  if (!token || searchParams.get("error")) {
    return (
      <>
        <h1 className="text-3xl font-semibold text-ink">This link has expired</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Reset links work once, for one hour. Ask for a new one and use the latest email.
        </p>
        <Link href="/forgot-password" className={buttonClasses("primary", "mt-8 w-full")}>
          Send a new link
        </Link>
      </>
    );
  }

  if (status.tone === "done") {
    return (
      <>
        <h1 className="text-3xl font-semibold text-ink">Password changed</h1>
        <p className="mt-2 text-sm text-ink-muted">
          You&apos;ve been signed out everywhere. Sign in with your new password.
        </p>
        <Link href="/login" className={buttonClasses("primary", "mt-8 w-full")}>
          Sign in
        </Link>
      </>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ tone: "pending", message: "" });
    const { error } = await resetPassword({ newPassword: password, token });
    if (!error) {
      setStatus({ tone: "done", message: "" });
      return;
    }
    let message = "Couldn't change your password. Try again.";
    if (error.code === "INVALID_TOKEN") {
      message = "This link has expired or was already used. Ask for a new one.";
    } else if (error.code === "PASSWORD_TOO_SHORT") {
      message = "Use at least 8 characters.";
    } else if (error.code === "PASSWORD_TOO_LONG") {
      message = "That password is too long.";
    }
    setStatus({ tone: "error", message });
  }

  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">Choose a new password</h1>
      <p className="mt-2 text-sm text-ink-muted">You&apos;ll use it to sign in from now on.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        {status.tone === "error" && <Alert>{status.message}</Alert>}
        <Field
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          hint="At least 8 characters."
          autoFocus
        />
        <Button type="submit" disabled={status.tone === "pending"} className="mt-1 w-full">
          {status.tone === "pending" ? "Saving…" : "Save new password"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-ink-muted">
        <Link href="/login" className={linkClasses}>
          Back to sign in
        </Link>
      </p>
    </>
  );
}
