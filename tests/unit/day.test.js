import { describe, expect, it, vi } from "vitest";
import { addDays, formatDay, todayIn } from "@/lib/day";

describe("day helpers", () => {
  it("adds days across month, year and leap-day boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("doesn't drift across a DST change (UTC arithmetic)", () => {
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30"); // Europe springs forward 29 Mar
  });

  it("labels today and yesterday, dates otherwise", () => {
    expect(formatDay("2026-09-24", "2026-09-24")).toBe("Today");
    expect(formatDay("2026-09-23", "2026-09-24")).toBe("Yesterday");
    expect(formatDay("2026-09-21", "2026-09-24")).toBe("Mon, Sep 21");
  });

  it("computes 'today' in the user's zone, not the server's", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-24T22:30:00Z"));
    try {
      expect(todayIn("UTC")).toBe("2026-09-24");
      expect(todayIn("Asia/Kolkata")).toBe("2026-09-25"); // UTC+5:30 is already tomorrow
      expect(todayIn("America/Los_Angeles")).toBe("2026-09-24");
    } finally {
      vi.useRealTimers();
    }
  });
});
