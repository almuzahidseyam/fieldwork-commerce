import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Package, ShieldCheck } from "lucide-react";
import { catalog, product } from "@/server/services/catalog";
import { AppError } from "@/server/errors";
import { ProductActions } from "@/components/product-actions";
import { ProductGrid } from "@/components/product-grid";
import { money } from "@/lib/money";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const p = await product((await params).slug);
    return { title: p.name, description: p.description };
  } catch {
    return { title: "Product" };
  }
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await product(slug).catch((error) => {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  });
  const all = await catalog();
  const related = all
    .filter((x) => x.slug !== p.slug)
    .sort(
      (a, b) =>
        Number(b.category === p.category) - Number(a.category === p.category),
    )
    .slice(0, 4);
  return (
    <div className="container detail-page">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">The collection</Link>
        <span>/</span>
        <span>{p.name}</span>
      </div>
      <section className="product-detail">
        <div className="detail-image">
          <Image
            src={p.image}
            alt={`${p.name} in ${p.color}`}
            fill
            priority
            sizes="(max-width: 800px) 100vw, 50vw"
          />
          {p.badge && <span className="product-badge">{p.badge}</span>}
          <span className="image-caption">
            THE EVERYDAY COLLECTION / FIELDWORK
          </span>
        </div>
        <div className="detail-info">
          <Link
            href={`/shop?category=${p.category}`}
            className="eyebrow category-back"
          >
            {p.category} <ArrowUpRight size={14} />
          </Link>
          <h1>{p.name}</h1>
          <div className="detail-price">
            {money(p.price)} <span>USD</span>
          </div>
          <p className="detail-description">{p.description}</p>
          <ProductActions product={p} />
          <div className="detail-specs">
            <h2>The details</h2>
            <ul>
              {p.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="detail-perks">
            <span>
              <Package size={18} /> Thoughtfully selected
            </span>
            <span>
              <ShieldCheck size={18} /> Your favorites, kept safe
            </span>
          </div>
        </div>
      </section>
      <section className="section related-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">BETTER TOGETHER</span>
            <h2>A little more good company.</h2>
          </div>
          <Link href="/shop" className="text-link">
            See everything <ArrowUpRight size={18} />
          </Link>
        </div>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
