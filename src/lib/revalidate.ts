import { revalidatePath } from "next/cache";

/**
 * Invalidate cached storefront pages after a mutation that affects what
 * visitors see (products, categories, settings, hero, slides, reviews, stock).
 * "/" as a layout path clears every page under the site layout; the public
 * settings route handler is prerendered and needs its own invalidation.
 */
export function revalidateStorefront() {
  revalidatePath("/", "layout");
  revalidatePath("/api/settings/public");
}
