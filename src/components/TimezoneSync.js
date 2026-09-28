"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Tells the server the browser's timezone so "today" matches the user's calendar.
export default function TimezoneSync() {
  const router = useRouter();

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const current = document.cookie.match(/(?:^|; )tz=([^;]*)/)?.[1];
    if (current && decodeURIComponent(current) === tz) return;

    document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}
