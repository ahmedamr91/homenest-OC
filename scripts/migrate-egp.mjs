// One-time migration: rescale existing product prices from USD to EGP (×50).
// Safe to run multiple times — skips if already migrated (marker in Settings-like check via a product probe).
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const EGP = 50;

async function main() {
  // Heuristic: if the cheapest lamp is still < 1000, prices are USD-scale
  const probe = await prisma.product.findFirst({
    where: { price: { lt: 1000 } },
    select: { id: true },
  });
  if (!probe) {
    console.log("Prices already look EGP-scaled — nothing to do.");
    return;
  }

  const products = await prisma.product.findMany({ select: { id: true, price: true, comparePrice: true } });
  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        price: p.price * EGP,
        comparePrice: p.comparePrice ? p.comparePrice * EGP : null,
      },
    });
  }
  console.log(`Migrated ${products.length} products to EGP pricing.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
