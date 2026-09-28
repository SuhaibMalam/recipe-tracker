// Seeds a demo account with realistic recipes and two weeks of food log, through
// the app's own HTTP API (so passwords are hashed by Better Auth and every write
// goes through the same validation as the UI).
//
//   npm run seed:demo                         # against http://localhost:3000
//   npm run seed:demo -- --reset              # wipe the demo account and reseed
//   SEED_BASE_URL=https://… npm run seed:demo # against a deployed instance
//
// Log dates are relative to the run, so run --reset daily to keep "today" filled.

const BASE = process.env.SEED_BASE_URL ?? "http://localhost:3000";
const DEMO = {
  name: "Demo Cook",
  email: process.env.DEMO_EMAIL ?? "demo@recipetracker.app",
  password: process.env.DEMO_PASSWORD ?? "try-the-demo-2026",
};

const recipes = [
  {
    title: "Tuesday lentil soup",
    description: "The one that gets made when the fridge is nearly empty.",
    servings: 4,
    steps:
      "Soften the onion and garlic in olive oil for 5 minutes.\nStir in cumin and turmeric for 30 seconds.\nAdd lentils, tomatoes and stock; simmer 20 minutes.\nBlend half, stir back in, season with lemon.",
    calories: 412,
    protein: 24,
    carbs: 58,
    fat: 9.5,
    ingredients: [
      ["red lentils", 250, "g"],
      ["onion", 1, "piece"],
      ["garlic", 3, "piece"],
      ["ground cumin", 2, "tsp"],
      ["turmeric", 1, "tsp"],
      ["chopped tomatoes", 400, "g"],
      ["vegetable stock", 1, "l"],
      ["lemon", 1, "piece"],
    ],
  },
  {
    title: "Overnight oats",
    description: "Five minutes the night before, breakfast sorted.",
    servings: 1,
    steps:
      "Stir everything together in a jar.\nRefrigerate overnight.\nTop with berries in the morning.",
    calories: 385,
    protein: 18,
    carbs: 52,
    fat: 11,
    ingredients: [
      ["rolled oats", 60, "g"],
      ["greek yoghurt", 100, "g"],
      ["milk", 120, "ml"],
      ["chia seeds", 1, "tbsp"],
      ["blueberries", 80, "g"],
    ],
  },
  {
    title: "Chickpea & spinach curry",
    description: "Weeknight curry, mostly from the cupboard.",
    servings: 4,
    steps:
      "Fry onion, ginger and garlic until golden.\nAdd curry paste and cook 1 minute.\nAdd chickpeas, tomatoes and coconut milk; simmer 15 minutes.\nWilt in the spinach and serve with rice.",
    calories: 520,
    protein: 17,
    carbs: 62,
    fat: 22,
    ingredients: [
      ["chickpeas", 800, "g"],
      ["onion", 1, "piece"],
      ["fresh ginger", 1, "tbsp"],
      ["garlic", 2, "piece"],
      ["curry paste", 3, "tbsp"],
      ["coconut milk", 400, "ml"],
      ["chopped tomatoes", 400, "g"],
      ["spinach", 200, "g"],
    ],
  },
  {
    title: "Lemon herb chicken traybake",
    servings: 4,
    steps:
      "Heat oven to 200°C.\nToss potatoes and chicken with oil, lemon and herbs.\nRoast 40 minutes, turning once.\nAdd green beans for the last 10 minutes.",
    calories: 560,
    protein: 42,
    carbs: 38,
    fat: 24,
    ingredients: [
      ["chicken thighs", 800, "g"],
      ["baby potatoes", 600, "g"],
      ["green beans", 200, "g"],
      ["lemon", 1, "piece"],
      ["olive oil", 2, "tbsp"],
      ["dried oregano", 2, "tsp"],
    ],
  },
  {
    title: "Garlic chilli noodles",
    description: "Faster than delivery.",
    servings: 2,
    steps:
      "Boil noodles.\nFry garlic and chilli flakes in oil until fragrant.\nToss noodles with the oil, soy and spring onion.",
    calories: 540,
    protein: 16,
    carbs: 82,
    fat: 17,
    ingredients: [
      ["egg noodles", 200, "g"],
      ["garlic", 4, "piece"],
      ["chilli flakes", 1, "tsp"],
      ["soy sauce", 2, "tbsp"],
      ["spring onion", 2, "piece"],
    ],
  },
  {
    title: "Greek salad",
    servings: 2,
    steps: "Chop everything into big pieces.\nDress with olive oil and oregano.",
    calories: 310,
    protein: 9,
    carbs: 12,
    fat: 26,
    ingredients: [
      ["tomatoes", 3, "piece"],
      ["cucumber", 1, "piece"],
      ["feta", 100, "g"],
      ["kalamata olives", 50, "g"],
      ["olive oil", 2, "tbsp"],
    ],
  },
];

const extras = [
  ["Flat white", 120, 6, 9, 7],
  ["Banana", 105, 1.3, 27, 0.4],
  ["Handful of almonds", 170, 6, 6, 15],
  ["Dark chocolate, 2 squares", 110, 1.5, 9, 8],
];

// Deterministic "randomness" so reruns produce the same demo week.
let seed = 7;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const localDay = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return new Intl.DateTimeFormat("en-CA").format(d);
};

// Minimal cookie jar: merge by name, so a response that only refreshes one
// cookie doesn't drop the session token.
const jar = new Map();
async function call(path, method = "GET", body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      origin: BASE,
      cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
    },
    body: body && JSON.stringify(body),
  });
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const pair = c.split(";")[0];
    const eq = pair.indexOf("=");
    jar.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
  const json = res.status === 204 ? null : await res.json().catch(() => null);
  return { status: res.status, json };
}

async function mustDelete(path) {
  const { status } = await call(path, "DELETE");
  if (status !== 204 && status !== 404) throw new Error(`DELETE ${path} failed: ${status}`);
}

// Wipes the demo user's own data (logs first, so recipe deletes don't have to
// null out log references). Only ever touches the signed-in demo account.
async function resetDemo() {
  const { json } = await call(`/api/logs?from=${localDay(365)}&to=${localDay(-1)}`);
  for (const log of json.logs) await mustDelete(`/api/logs/${log.id}`);

  let recipesRemoved = 0;
  for (;;) {
    const page = await call("/api/recipes");
    if (page.json.recipes.length === 0) break;
    for (const r of page.json.recipes) {
      await mustDelete(`/api/recipes/${r.id}`);
      recipesRemoved++;
    }
  }
  console.log(`Reset: removed ${recipesRemoved} recipes and ${json.logs.length} log entries.`);
}

async function main() {
  let res = await call("/api/auth/sign-in/email", "POST", {
    email: DEMO.email,
    password: DEMO.password,
  });
  if (res.status !== 200) {
    res = await call("/api/auth/sign-up/email", "POST", DEMO);
    if (res.status !== 200)
      throw new Error(`Couldn't create demo user: ${res.status} ${JSON.stringify(res.json)}`);
  }

  if (process.argv.includes("--reset")) {
    await resetDemo();
  } else {
    const existing = await call("/api/recipes");
    if (existing.json.total > 0) {
      console.log(
        `Demo account already has ${existing.json.total} recipes — nothing to do (use --reset to rebuild).`,
      );
      return;
    }
  }

  const ids = [];
  for (const r of recipes) {
    const { ingredients, ...rest } = r;
    const { status, json } = await call("/api/recipes", "POST", {
      ...rest,
      ingredients: ingredients.map(([name, quantity, unit]) => ({ name, quantity, unit })),
    });
    if (status !== 201) throw new Error(`Recipe "${r.title}" failed: ${JSON.stringify(json)}`);
    ids.push(json.recipe.id);
  }

  let entries = 0;
  for (let offset = 13; offset >= 0; offset--) {
    const day = localDay(offset);
    const meals = [ids[1], ids[2 + Math.floor(rand() * 4)], ids[Math.floor(rand() * ids.length)]];
    for (const recipeId of meals.slice(0, offset === 0 ? 2 : 3)) {
      await call("/api/logs", "POST", {
        source: "recipe",
        recipeId,
        servings: rand() > 0.7 ? 1.5 : 1,
        day,
      });
      entries++;
    }
    const [name, calories, protein, carbs, fat] = extras[Math.floor(rand() * extras.length)];
    await call("/api/logs", "POST", { source: "manual", name, calories, protein, carbs, fat, day });
    entries++;
  }

  await call("/api/me", "PATCH", { calorieGoal: 2100 });
  console.log(`Seeded ${recipes.length} recipes and ${entries} log entries for ${DEMO.email}.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
