"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/lib/auth-client";
import { nameSchema } from "@/lib/validations/account";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";

export default function ProfileForm({ name }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [status, setStatus] = useState({ tone: "idle", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = nameSchema.safeParse(value);
    if (!parsed.success) {
      setStatus({ tone: "error", message: parsed.error.issues[0].message });
      return;
    }

    setStatus({ tone: "pending", message: "" });
    const { error } = await updateUser({ name: parsed.data });
    if (error) {
      setStatus({ tone: "error", message: "Couldn't save your name. Try again." });
      return;
    }
    setValue(parsed.data);
    setStatus({ tone: "done", message: "Saved." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field
        label="Name"
        name="name"
        autoComplete="name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error={status.tone === "error" ? status.message : undefined}
        className="max-w-sm"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status.tone === "pending"}>
          {status.tone === "pending" ? "Saving…" : "Save name"}
        </Button>
        <p aria-live="polite" className="text-sm text-sage-deep">
          {status.tone === "done" && status.message}
        </p>
      </div>
    </form>
  );
}
