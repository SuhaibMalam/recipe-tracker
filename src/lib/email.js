import "server-only";
import nodemailer from "nodemailer";
import { SITE_NAME } from "@/lib/site";

// Gmail SMTP with an App Password: free, sends to any address, ~500/day.
// ponytail: Gmail sender; move to Resend + a verified domain for volume or a branded From address.
const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

const transport =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      })
    : null;

// Plain text only: user-supplied values (like the name) can't inject markup.
export async function sendEmail({ to, subject, text }) {
  if (!transport) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email isn't configured: set GMAIL_USER and GMAIL_APP_PASSWORD.");
    }
    // Local dev without credentials: print it so the flow can still be tried.
    console.info(`\n[email] To: ${to}\nSubject: ${subject}\n\n${text}\n`);
    return;
  }
  await transport.sendMail({ from: `${SITE_NAME} <${GMAIL_USER}>`, to, subject, text });
}
