"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import Button from "@/components/ui/Button";

export default function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={handleSignOut} disabled={pending}>
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
