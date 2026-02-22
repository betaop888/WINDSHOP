const { spawnSync } = require("child_process");

const env = { ...process.env };
env.DATABASE_URL =
  env.DATABASE_URL ||
  env.POSTGRES_PRISMA_URL ||
  env.POSTGRES_URL_NON_POOLING ||
  env.POSTGRES_URL ||
  "";

function isTruthy(value) {
  if (typeof value !== "string") return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

if (!env.DATABASE_URL) {
  console.warn(
    [
      "Prisma db push skipped: DATABASE_URL is not set.",
      "For shared online mode, set DATABASE_URL in Vercel Environment Variables",
      "or connect Vercel Postgres (POSTGRES_PRISMA_URL will be auto-used)."
    ].join("\n")
  );
  process.exit(0);
}

const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const hasExplicitFlag = typeof env.PRISMA_DB_PUSH_ACCEPT_DATA_LOSS === "string";
const acceptDataLoss = hasExplicitFlag
  ? isTruthy(env.PRISMA_DB_PUSH_ACCEPT_DATA_LOSS)
  : env.VERCEL === "1";

const prismaArgs = ["prisma", "db", "push"];
if (acceptDataLoss) {
  prismaArgs.push("--accept-data-loss");
  console.log("Prisma db push: --accept-data-loss enabled.");
}

const result = spawnSync(npxCommand, prismaArgs, {
  stdio: "inherit",
  env
});

process.exit(result.status ?? 1);
