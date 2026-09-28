import "server-only";

// The "Try the demo" button only appears when both are configured.
export const demoEnabled = () => Boolean(process.env.DEMO_EMAIL && process.env.DEMO_PASSWORD);
