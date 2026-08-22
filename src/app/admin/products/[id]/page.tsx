import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductForm from "../product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { colors: true } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">
        Edit — {product.name}
      </h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          stock: product.stock,
          featured: product.featured,
          published: product.published,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          colors: product.colors.map((c) => ({
            id: c.id,
            name: c.name,
            hex: c.hex,
          })),
        }}
      />
    </div>
  );
}
