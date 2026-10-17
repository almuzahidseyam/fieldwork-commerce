import Link from "next/link";
import { SearchX } from "lucide-react";
import { catalog, categoryList } from "@/server/services/catalog";
import { filtersSchema } from "@/server/validation";
import { ProductGrid } from "@/components/product-grid";
import { ShopFilters } from "@/components/shop-filters";
export const dynamic = "force-dynamic";
export const metadata = { title: "The collection" };
export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const allowed = ["search", "category", "sort", "maxPrice", "inStock"];
  const values = Object.fromEntries(Object.entries(raw).filter(([key, value]) => allowed.includes(key) && typeof value === "string" && value !== ""));
  const parsed = filtersSchema.safeParse(values);
  const filters = parsed.success ? parsed.data : {};
  const [products, categories] = await Promise.all([catalog(filters), categoryList()]);
  const category = categories.find(c => c.slug === filters.category);
  return <div className="container shop-page"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>The collection</span></div><div className="page-intro"><span className="eyebrow">THE EVERYDAY COLLECTION</span><h1>{category ? category.name : "Considered essentials."}</h1><p>{category?.description || "Good things to carry, wear, use, and make your own."}</p></div><ShopFilters categories={categories} filters={filters}/>{!parsed.success && <p role="alert" className="inline-error">Those filters weren’t valid. We’ve shown the full collection instead.</p>}<div className="results-heading"><p>{products.length} {products.length === 1 ? "essential" : "essentials"}{filters.search ? ` matching “${filters.search}”` : " for your everyday"}</p><span>CHOSEN WITH CARE, ALWAYS.</span></div>{products.length ? <ProductGrid products={products}/> : <div className="empty-state"><SearchX size={38}/><h2>Nothing here just yet.</h2><p>Try a different search or give your filters a little more room.</p><Link href="/shop" className="button button-dark">See all essentials</Link></div>}</div>;
}
