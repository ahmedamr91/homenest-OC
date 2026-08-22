// Verifies every table the app needs exists on the connected database.
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const checks = {
  categories: () => p.category.count(),
  products: () => p.product.count(),
  productColors: () => p.productColor.count(),
  productImages: () => p.productImage.count(),
  reviews: () => p.review.count(),
  discountCodes: () => p.discountCode.count(),
  orders: () => p.order.count(),
  orderItems: () => p.orderItem.count(),
  customRequests: () => p.customRequest.count(),
  subscribers: () => p.subscriber.count(),
  pageViewDays: () => p.pageViewDay.count(),
  emailLogs: () => p.emailLog.count(),
};

let fail = false;
for (const [name, fn] of Object.entries(checks)) {
  try {
    const n = await fn();
    console.log(`✓ ${name}: ${n}`);
  } catch (e) {
    fail = true;
    console.log(`✗ ${name}: MISSING — ${(e.message || "").slice(0, 80)}`);
  }
}

const sample = await p.product.findFirst({ select: { price: true } });
console.log(`Sample price: ${sample?.price} (EGP-scale if > 1000)`);
await p.$disconnect();
if (fail) process.exit(1);
