"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { safeRedirectPath } from "@/lib/safe-redirect";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Alert from "@/components/ui/Alert";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeRedirectPath(searchParams.get("next"));
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn.email({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(
        error.status === 429
          ? "Too many attempts. Give it a minute and try again."
          : "That email and password don't match an account.",
      );
      setLoading(false);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-ink-muted">Pick up where you left off in the kitchen.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        {error && <Alert>{error}</Alert>}

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
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Link
          href="/forgot-password"
          className="-mt-3 self-end text-sm font-medium text-terracotta-deep underline decoration-terracotta/40 underline-offset-4 hover:decoration-terracotta-deep"
        >
          Forgot password?
        </Link>

        <Button type="submit" disabled={loading} className="mt-1 w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-ink-muted">
        New here?{" "}
        <Link
          href="/register"
          className="font-medium text-terracotta-deep underline decoration-terracotta/40 underline-offset-4 hover:decoration-terracotta-deep"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
