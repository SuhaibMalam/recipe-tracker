import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

// Capture outgoing email instead of sending it; the test reads the link from it.
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));

const OLD = "old-password-123";
const NEW = "new-password-456";
let seq = 0;

async function signUp() {
  seq += 1;
  const email = `reset-${process.pid}-${Date.now()}-${seq}@test.local`;
  await auth.api.signUpEmail({ body: { name: "Forgetful Cook", email, password: OLD } });
  return email;
}

async function requestReset(email) {
  return auth.api.requestPasswordReset({ body: { email, redirectTo: "/reset-password" } });
}

const tokenFromEmail = () =>
  sendEmail.mock.calls.at(-1)[0].text.match(/reset-password\/([^?\s]+)/)[1];

beforeEach(() => sendEmail.mockClear());
afterEach(() => {
  delete process.env.DEMO_EMAIL;
  delete process.env.DEMO_PASSWORD;
});

describe("password reset", () => {
  it("emails a one-time link that sets a new password", async () => {
    const email = await signUp();
    await requestReset(email);

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail.mock.calls[0][0].to).toBe(email);
    const token = tokenFromEmail();

    await auth.api.resetPassword({ body: { newPassword: NEW, token } });

    await expect(auth.api.signInEmail({ body: { email, password: NEW } })).resolves.toBeTruthy();
    await expect(auth.api.signInEmail({ body: { email, password: OLD } })).rejects.toMatchObject({
      statusCode: 401,
    });
    // The link only works once.
    await expect(
      auth.api.resetPassword({ body: { newPassword: "third-password-789", token } }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("answers the same for unknown emails and sends nothing", async () => {
    const res = await requestReset(`nobody-${Date.now()}@test.local`);
    expect(res.status).toBe(true);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("never emails the shared demo account", async () => {
    const email = await signUp();
    process.env.DEMO_EMAIL = email;
    process.env.DEMO_PASSWORD = OLD;
    await requestReset(email);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
