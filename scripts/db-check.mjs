import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const [cats, prods, colors, admins] = await Promise.all([
  p.category.count(),
  p.product.count(),
  p.productColor.count(),
  p.admin.count(),
]);
console.log(`Neon DB check → categories: ${cats}, products: ${prods}, color variants: ${colors}, admins: ${admins}`);
await p.$disconnect();
