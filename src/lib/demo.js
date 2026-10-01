import "server-only";

// The "Try the demo" button only appears when both are configured.
export const demoEnabled = () => Boolean(process.env.DEMO_EMAIL && process.env.DEMO_PASSWORD);

// The shared demo account can be used freely but not renamed, re-passworded or deleted.
export const isDemoUser = (user) => demoEnabled() && user?.email === process.env.DEMO_EMAIL;
