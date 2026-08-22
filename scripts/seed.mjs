import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Lighting", slug: "lighting", description: "Table lamps, floor lamps and pendant lights to set the mood." },
  { name: "Vases & Planters", slug: "vases-planters", description: "Ceramic vases and planters for fresh and dried florals." },
  { name: "Cushions & Throws", slug: "cushions-throws", description: "Soft textures that make a house feel like home." },
  { name: "Wall Decor", slug: "wall-decor", description: "Art, frames and hangings with character." },
  { name: "Mirrors", slug: "mirrors", description: "Statement mirrors that open up every room." },
  { name: "Storage & Baskets", slug: "storage-baskets", description: "Beautiful ways to keep the everyday tidy." },
];

// [name, price, comparePrice, stock, featured, colors[[name,hex]], desc]
const products = {
  lighting: [
    ["Ceramic Table Lamp", 89, 119, 24, true, [["Terracotta", "#B4552D"], ["Sand Beige", "#D6C3A5"], ["Deep Green", "#4A5D43"]], "A hand-glazed ceramic base with a linen drum shade. Warm, diffused light perfect for bedside tables and console styling."],
    ["Rattan Pendant Light", 145, null, 12, true, [["Natural", "#C9A876"], ["Charcoal", "#3B3735"]], "Woven rattan dome that casts beautiful patterned shadows. Hangs from an adjustable cotton cord."],
    ["Brass Arc Floor Lamp", 210, 260, 8, false, [["Antique Brass", "#A67C52"], ["Matte Black", "#2B2926"]], "A sculptural arc lamp in brushed brass with a marble base. Reads perfectly over armchairs and sofas."],
    ["Glass Mushroom Lamp", 64, null, 30, false, [["Amber", "#D08C3C"], ["Smoke Grey", "#7A7570"], ["Milk White", "#EFEAE0"]], "Retro-inspired mushroom lamp in tinted glass with a dimmable warm LED."],
  ],
  "vases-planters": [
    ["Ribbed Stone Vase", 48, null, 40, true, [["Off-White", "#EDE6DA"], ["Clay", "#B4552D"], ["Slate Blue", "#5C6B73"]], "Weighty ribbed vase in cast stone with a soft matte finish. Beautiful empty, stunning with stems."],
    ["Terracotta Planter Set", 56, 72, 26, false, [["Raw Terracotta", "#C06A42"], ["Blush", "#DCA793"]], "Set of three nesting planters with drainage trays, in breathable raw terracotta."],
    ["Bubble Glass Vase", 39, null, 35, false, [["Amber", "#D08C3C"], ["Ocean", "#5B7B94"], ["Clear", "#E8EEF1"]], "Hand-blown bubble glass with organic curves. No two are exactly alike."],
    ["Hanging Macrame Planter", 28, null, 50, false, [["Ecru", "#E5DAC8"], ["Olive", "#6B7047"]], "Hand-knotted macrame hanger that holds pots up to 18cm."],
  ],
  "cushions-throws": [
    ["Linen Cushion Cover", 32, null, 60, true, [["Ivory", "#F1EBDF"], ["Rust", "#A8542F"], ["Sage", "#9CAF88"], ["Ink", "#2E3440"]], "Stonewashed European linen with hidden zip. Softens beautifully with every wash."],
    ["Chunky Knit Throw", 98, 128, 18, true, [["Cream", "#F0E8D9"], ["Camel", "#C19A6B"], ["Forest", "#3D4A3A"]], "Oversized chunky-knit throw in recycled cotton blend. Made for slow Sundays."],
    ["Velvet Bolster Pillow", 44, null, 25, false, [["Emerald", "#2F5D50"], ["Blush Pink", "#DBA8A0"], ["Mustard", "#C99A3C"]], "Cylindrical velvet bolster with piping detail. The finishing touch any sofa needs."],
    ["Waffle Cotton Blanket", 58, null, 32, false, [["Oat", "#E3D7C2"], ["Terracotta", "#B4552D"], ["Stone", "#A8A096"]], "Breathable waffle-weave cotton blanket, generous 220x240cm size."],
  ],
  "wall-decor": [
    ["Arched Wall Mirror Art", 120, 150, 10, false, [["Brass", "#A67C52"], ["Black", "#2B2926"]], "Arched metal wall sculpture with interlocking circles. Catches light all day."],
    ["Framed Botanical Print Set", 75, null, 22, false, [["Oak Frame", "#C19A6B"], ["Walnut Frame", "#5D4632"]], "Set of six vintage botanical prints, museum-quality on textured paper."],
    ["Macrame Wall Hanging", 54, null, 20, false, [["Ecru", "#E5DAC8"], ["Terracotta Dip-Dye", "#C0784E"]], "Large hand-knotted wall hanging with dip-dyed ends. Instant warmth for bare walls."],
  ],
  mirrors: [
    ["Full-Length Arch Mirror", 189, 230, 9, true, [["Brass", "#A67C52"], ["Matte Black", "#2B2926"], ["Silver", "#BFC5C9"]], "160cm arched full-length mirror with a slim metal frame. Lean it or wall-mount it."],
    ["Round Sunburst Mirror", 135, null, 14, false, [["Gold", "#C6A15B"], ["Bronze", "#8A6B47"]], "Mid-century sunburst mirror with tapered rays. A statement above any console."],
    ["Organic Blob Wall Mirror", 88, null, 16, false, [["Sand", "#D6C3A5"], ["White", "#F2EEE7"]], "Asymmetric resin-framed mirror with organic curves and soft matte finish."],
  ],
  "storage-baskets": [
    ["Seagrass Storage Basket", 42, null, 45, true, [["Natural", "#C9A876"], ["Whitewash", "#E8E2D5"]], "Hand-woven seagrass basket with sturdy handles. Toys, throws or firewood."],
    ["Stackable Oak Boxes", 96, 118, 15, false, [["Natural Oak", "#D2B48C"], ["Smoked Oak", "#6E5843"]], "Set of two stackable oak storage boxes with sliding lids and finger joints."],
    ["Wire Magazine Holder", 34, null, 28, false, [["Black", "#2B2926"], ["Copper", "#B87333"]], "Minimal wire holder that keeps reading material off the coffee table."],
  ],
};

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.admin.deleteMany();

  for (const c of categories) {
    await prisma.category.create({ data: c });
  }

  const catIds = {};
  for (const c of await prisma.category.findMany()) catIds[c.slug] = c.id;

  let count = 0;
  for (const [catSlug, items] of Object.entries(products)) {
    for (const [name, price, comparePrice, stock, featured, colors, description] of items) {
      await prisma.product.create({
        data: {
          name,
          slug: slugify(name),
          description,
          price,
          comparePrice,
          stock,
          featured,
          categoryId: catIds[catSlug],
          colors: { create: colors.map(([cname, hex]) => ({ name: cname, hex })) },
        },
      });
      count++;
    }
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@12345", 12);
  await prisma.admin.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@maison.local",
      passwordHash,
      name: "Store Admin",
    },
  });

  console.log(`Seeded ${categories.length} categories, ${count} products, admin user.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
