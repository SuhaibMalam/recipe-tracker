import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PATCH } from "@/app/api/me/route";
import { createUser, request } from "./helpers";

vi.mock("@/lib/session", () => ({ getSession: vi.fn(), requireUser: vi.fn() }));

const patch = (body) => PATCH(request("/api/me", "PATCH", body));

let user;
beforeEach(async () => {
  user = await createUser();
  getSession.mockResolvedValue({ user });
});

describe("PATCH /api/me", () => {
  it("returns 401 without a session", async () => {
    getSession.mockResolvedValue(null);
    expect((await patch({ calorieGoal: 2000 })).status).toBe(401);
  });

  it("rejects goals outside the safe range", async () => {
    for (const calorieGoal of [300, 7000, 1999.5]) {
      const res = await patch({ calorieGoal });
      expect(res.status).toBe(400);
      expect((await res.json()).fieldErrors.calorieGoal).toBeDefined();
    }
  });

  it("sets the goal, then clears it with null", async () => {
    const set = await patch({ calorieGoal: "2000" });
    expect(await set.json()).toEqual({ calorieGoal: 2000 });

    const cleared = await patch({ calorieGoal: null });
    expect(await cleared.json()).toEqual({ calorieGoal: null });

    const stored = await prisma.user.findUnique({ where: { id: user.id } });
    expect(stored.calorieGoal).toBeNull();
  });
});
