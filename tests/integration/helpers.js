import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

let seq = 0;

// Inserted directly: the tests exercise the app's API, not Better Auth's sign-up.
export function createUser(name = "Test Cook") {
  seq += 1;
  return prisma.user.create({
    data: { name, email: `cook-${process.pid}-${Date.now()}-${seq}@test.local` },
  });
}

export function request(path, method = "GET", body) {
  return new NextRequest(new URL(path, "http://localhost"), {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

// Route handlers receive dynamic params as a Promise in Next 16.
export const params = (id) => ({ params: Promise.resolve({ id }) });

export const soup = {
  title: "Tuesday lentil soup",
  servings: 4,
  steps: "Soften onion.\nAdd lentils and stock.\nSimmer.",
  calories: 412,
  protein: 24,
  carbs: 58,
  fat: 9.5,
  ingredients: [
    { name: "Red Lentils", quantity: 200, unit: "g" },
    { name: "Onion", quantity: 1, unit: "piece" },
  ],
};
