const { spawnSync } = require("child_process");

const env = { ...process.env };
env.DATABASE_URL =
  env.DATABASE_URL ||
  env.POSTGRES_PRISMA_URL ||
  env.POSTGRES_URL_NON_POOLING ||
  env.POSTGRES_URL ||
  "";

if (!env.DATABASE_URL) {
  console.error(
    [
      "Prisma db push failed: DATABASE_URL is not set.",
      "Set DATABASE_URL in Vercel Environment Variables",
      "or connect Vercel Postgres (POSTGRES_PRISMA_URL will be auto-used)."
    ].join("\n")
  );
  process.exit(1);
}

const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(npxCommand, ["prisma", "db", "push"], {
  stdio: "inherit",
  env
});

process.exit(result.status ?? 1);
