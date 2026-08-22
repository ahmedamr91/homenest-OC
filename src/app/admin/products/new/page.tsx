import { db } from "@/lib/db";
import ProductForm from "../product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">New product</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={{
          name: "",
          description: "",
          price: 0,
          comparePrice: null,
          stock: 0,
          featured: false,
          published: true,
          imageUrl: null,
          categoryId: null,
          colors: [],
        }}
      />
    </div>
  );
}
