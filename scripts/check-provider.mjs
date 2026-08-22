// Blocks builds when the schema is accidentally left in SQLite dev mode.
import { readFileSync } from "fs";

const schema = readFileSync("prisma/schema.prisma", "utf8");
if (/provider\s*=\s*"sqlite"/.test(schema)) {
  console.error(
    "\n✗ BUILD BLOCKED: prisma/schema.prisma is in SQLite dev mode.\n" +
      "  Run:  node scripts/db-provider.mjs postgresql\n" +
      "  then commit and build again.\n"
  );
  process.exit(1);
}
console.log("✓ Prisma provider: postgresql");
