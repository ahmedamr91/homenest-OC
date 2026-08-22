// Validates .env before setup/deploy. Run: npm run check
import { readFileSync, existsSync } from "fs";

if (!existsSync(".env")) {
  console.error("✗ .env not found. Copy .env.example to .env first.");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+ *=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    })
);

let ok = true;
const fail = (msg) => { console.error("  ✗ " + msg); ok = false; };
const pass = (msg) => console.log("  ✓ " + msg);

console.log("\nHOMENEST config check\n─────────────────────");

// DATABASE_URL
const db = env.DATABASE_URL || "";
if (!db) fail('DATABASE_URL is empty → neon.tech → Connect → "Pooled connection" → paste here');
else if (!db.startsWith("postgresql://")) fail("DATABASE_URL must start with postgresql://");
else if (!db.includes("-pooler.")) {
  pass("DATABASE_URL set (note: not a -pooler host — use the Pooled connection string on Vercel)");
} else pass("DATABASE_URL: Neon pooled connection ✓");
if (db && !db.includes("sslmode=require")) console.warn("  ⚠ tip: append ?sslmode=require if missing");

// UPLOADTHING_TOKEN
const ut = env.UPLOADTHING_TOKEN || "";
if (!ut) fail("UPLOADTHING_TOKEN is empty → uploadthing.com → API Keys → copy token");
else if (!ut.startsWith("eyJ")) console.warn("  ⚠ UPLOADTHING_TOKEN set (unusual format — double-check it)");
else pass("UPLOADTHING_TOKEN ✓");

// AUTH_SECRET
const s = env.AUTH_SECRET || "";
if (!s || s.length < 32 || s.includes("change-me") || s.includes("m4i5on"))
  fail("AUTH_SECRET weak/placeholder → replace with a long random string");
else pass(`AUTH_SECRET (${s.length} chars) ✓`);

// ADMIN
const em = env.ADMIN_EMAIL || "";
const pw = env.ADMIN_PASSWORD || "";
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) fail("ADMIN_EMAIL invalid");
else pass(`ADMIN_EMAIL: ${em} ✓`);
if (!pw || pw.length < 10) fail("ADMIN_PASSWORD too short (<10 chars)");
else pass(`ADMIN_PASSWORD (${pw.length} chars) ✓`);

console.log("─────────────────────");
if (ok) {
  console.log("All good! Next step:\n  npm run setup     # creates tables + seeds data\n  npm run dev       # http://localhost:3000\n");
} else {
  console.log("Fix the ✗ items in .env, then run this again.\n");
  process.exit(1);
}
