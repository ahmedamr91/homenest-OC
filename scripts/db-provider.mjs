// Flips the Prisma datasource provider between postgresql (Vercel/Neon)
// and sqlite (offline local tinkering). Usage:
//   node scripts/db-provider.mjs sqlite
//   node scripts/db-provider.mjs postgresql
import { readFileSync, writeFileSync } from "fs";

const target = process.argv[2];
if (!["sqlite", "postgresql"].includes(target)) {
  console.error("Usage: node scripts/db-provider.mjs <sqlite|postgresql>");
  process.exit(1);
}

const path = "prisma/schema.prisma";
let schema = readFileSync(path, "utf8");
schema = schema.replace(
  /provider = "(sqlite|postgresql)"/,
  `provider = "${target}"`
);
if (/provider = "postgresql"/.test(schema) && target === "sqlite") {
  // unreachable guard kept for clarity
}
writeFileSync(path, schema);
console.log(`Prisma provider set to: ${target}`);
