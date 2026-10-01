import * as z from "zod";

// Shared by the settings form and the Better Auth hook that guards sign-up and
// profile updates, so a name can't be blank or huge whichever way it arrives.
export const nameSchema = z
  .string("Enter your name")
  .trim()
  .min(1, "Enter your name")
  .max(100, "Keep it under 100 characters");
