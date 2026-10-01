import { afterEach, describe, expect, it } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { soup } from "./helpers";

const PASSWORD = "account-test-pass-1";
let seq = 0;

// Real Better Auth sign-up; returns the user and request headers carrying its session.
async function signUp(name = "Settings Cook") {
  seq += 1;
  const email = `account-${process.pid}-${Date.now()}-${seq}@test.local`;
  const { headers, response } = await auth.api.signUpEmail({
    body: { name, email, password: PASSWORD },
    returnHeaders: true,
  });
  const cookie = headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  return { user: response.user, headers: new Headers({ cookie }) };
}

afterEach(() => {
  delete process.env.DEMO_EMAIL;
  delete process.env.DEMO_PASSWORD;
});

describe("account deletion", () => {
  it("removes the user with their recipes and food log", async () => {
    const { user, headers } = await signUp();
    const recipe = await prisma.recipe.create({
      data: { userId: user.id, title: soup.title, steps: soup.steps, calories: 412 },
    });
    await prisma.nutritionLog.create({
      data: {
        userId: user.id,
        recipeId: recipe.id,
        name: soup.title,
        day: new Date("2026-09-20T00:00:00Z"),
        calories: 412,
        protein: 24,
        carbs: 58,
        fat: 9.5,
      },
    });

    await auth.api.deleteUser({ headers, body: { password: PASSWORD } });

    const where = { userId: user.id };
    expect(await prisma.user.count({ where: { id: user.id } })).toBe(0);
    expect(await prisma.recipe.count({ where })).toBe(0);
    expect(await prisma.nutritionLog.count({ where })).toBe(0);
    expect(await prisma.account.count({ where })).toBe(0);
  });

  it("keeps everything when the password is wrong", async () => {
    const { user, headers } = await signUp();
    await expect(
      auth.api.deleteUser({ headers, body: { password: "not-my-password" } }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(await prisma.user.count({ where: { id: user.id } })).toBe(1);
  });
});

describe("the shared demo account", () => {
  it("can't be renamed, re-passworded or deleted", async () => {
    const { user, headers } = await signUp("Demo Cook");
    process.env.DEMO_EMAIL = user.email;
    process.env.DEMO_PASSWORD = PASSWORD;

    const forbidden = { statusCode: 403 };
    await expect(auth.api.updateUser({ headers, body: { name: "Hacked" } })).rejects.toMatchObject(
      forbidden,
    );
    await expect(
      auth.api.changePassword({
        headers,
        body: { currentPassword: PASSWORD, newPassword: "locked-everyone-out" },
      }),
    ).rejects.toMatchObject(forbidden);
    await expect(
      auth.api.deleteUser({ headers, body: { password: PASSWORD } }),
    ).rejects.toMatchObject(forbidden);

    const stored = await prisma.user.findUnique({ where: { id: user.id } });
    expect(stored.name).toBe("Demo Cook");
  });
});

describe("names", () => {
  it("rejects blank or oversized names on sign-up and on update", async () => {
    await expect(signUp("   ")).rejects.toMatchObject({ statusCode: 400 });
    await expect(signUp("x".repeat(101))).rejects.toMatchObject({ statusCode: 400 });

    const { user, headers } = await signUp();
    await expect(auth.api.updateUser({ headers, body: { name: "" } })).rejects.toMatchObject({
      statusCode: 400,
    });
    await auth.api.updateUser({ headers, body: { name: "  Renamed Cook " } });
    expect((await prisma.user.findUnique({ where: { id: user.id } })).name).toBe("Renamed Cook");
  });
});
