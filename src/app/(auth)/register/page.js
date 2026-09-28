"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Alert from "@/components/ui/Alert";

// Unknown codes get a generic message so raw server errors never reach the page.
const SAFE_ERROR_CODES = new Set(["PASSWORD_TOO_SHORT", "PASSWORD_TOO_LONG", "INVALID_EMAIL"]);

// The sign-up API already answers 422 for a taken email, so hiding it here
// would protect nothing and just strand real users. Preventing email probing
// properly needs email verification (always answer "check your inbox").
const EMAIL_TAKEN = "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signUp.email({
      name: form.name.trim(),
      email: form.email,
      password: form.password,
    });

    if (error) {
      if (error.status === 429) {
        setError("Too many attempts. Give it a minute and try again.");
      } else if (error.code === EMAIL_TAKEN) {
        setError(
          <>
            There&apos;s already an account with that email.{" "}
            <Link href="/login" className="font-medium underline underline-offset-2">
              Sign in instead
            </Link>
          </>,
        );
      } else {
        setError(
          SAFE_ERROR_CODES.has(error.code)
            ? error.message
            : "We couldn't create that account. Check your details and try again.",
        );
      }
      setLoading(false);
      return;
    }

    // autoSignIn is on in auth.js, so the session already exists.
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">Start your recipe box</h1>
      <p className="mt-2 text-sm text-ink-muted">Save what you cook and see what it adds up to.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        {error && <Alert>{error}</Alert>}

        <Field
          label="Name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
          hint="At least 8 characters."
        />

        <Button type="submit" disabled={loading} className="mt-1 w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-ink-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-terracotta-deep underline decoration-terracotta/40 underline-offset-4 hover:decoration-terracotta-deep"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
