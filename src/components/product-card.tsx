"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Plus, LoaderCircle, ArrowUpRight } from "lucide-react";
import type { Product } from "@/types/commerce";
import { money } from "@/lib/money";
import { useStore } from "./store-provider";

export function ProductCard({ product }: { product: Product }) {
  const { add, toggleWish, wishlist, ready } = useStore();
  const [busy, setBusy] = useState("");
  const saved = wishlist.items.some((p) => p.slug === product.slug);
  async function action(kind: "add" | "wish") {
    setBusy(kind);
    try {
      await (kind === "add" ? add(product.slug) : toggleWish(product.slug));
    } catch {
    } finally {
      setBusy("");
    }
  }
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link
          href={`/products/${product.slug}`}
          className="product-image-link"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
            className="product-image"
          />
        </Link>
        {product.badge && (
          <span className={`product-badge ${!product.stock ? "muted" : ""}`}>
            {product.badge}
          </span>
        )}
        <button
          className={`save-button ${saved ? "saved" : ""}`}
          aria-label={`${saved ? "Unsave" : "Save"} ${product.name}`}
          aria-pressed={saved}
          disabled={!ready || !!busy}
          onClick={() => void action("wish")}
        >
          {busy === "wish" ? (
            <LoaderCircle size={17} className="spin" />
          ) : (
            <Heart size={18} fill={saved ? "currentColor" : "none"} />
          )}
        </button>
        <button
          className="quick-add"
          disabled={!ready || !!busy || !product.stock}
          onClick={() => void action("add")}
          aria-label={`Add ${product.name} to bag`}
        >
          {busy === "add" ? (
            <LoaderCircle size={17} className="spin" />
          ) : (
            <Plus size={18} />
          )}
          <span>
            {!product.stock
              ? "Out of stock"
              : busy === "add"
                ? "Adding…"
                : "Add to bag"}
          </span>
        </button>
      </div>
      <div className="product-meta">
        <div>
          <span className="product-category">
            {product.category} / {product.color}
          </span>
          <h3>
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>
        <span className="product-price">{money(product.price)}</span>
      </div>
      <Link href={`/products/${product.slug}`} className="product-detail-link">
        Take a closer look <ArrowUpRight size={13} />
      </Link>
    </article>
  );
}
