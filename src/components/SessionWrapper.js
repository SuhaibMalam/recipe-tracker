"use client";

import { authClient } from "@/lib/auth-client";

export default function SessionWrapper({ children }) {
  return <>{children}</>;
}
