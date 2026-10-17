"use client";
import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, LoaderCircle, Check } from "lucide-react";
import type { Product } from "@/types/commerce";
import { useStore } from "./store-provider";
export function ProductActions({ product }: { product: Product }) {
  const store = useStore();
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState("");
  const saved = store.wishlist.items.some(p => p.slug === product.slug);
  async function action(type: string) { setBusy(type); try { if (type === "add") await store.add(product.slug, quantity); else await store.toggleWish(product.slug); } catch {} finally { setBusy(""); } }
  return <><div className="detail-color"><span>Color</span><strong>{product.color}</strong><span className="color-swatch"/></div><p className={`stock-note ${product.stock ? "" : "out"}`}>{product.stock ? <><Check size={15}/> In stock · {product.stock} available</> : "Currently out of stock"}</p><div className="purchase-row"><div className="quantity-control"><button aria-label="Decrease quantity" disabled={quantity <= 1 || !!busy} onClick={() => setQuantity(q => q - 1)}><Minus size={15}/></button><output aria-live="polite" aria-label="Quantity">{quantity}</output><button aria-label="Increase quantity" disabled={quantity >= Math.min(product.stock, 99) || !!busy || !product.stock} onClick={() => setQuantity(q => q + 1)}><Plus size={15}/></button></div><button className="button button-dark add-bag-button" disabled={!store.ready || !product.stock || !!busy} onClick={() => void action("add")}>{busy === "add" ? <LoaderCircle size={18} className="spin"/> : <ShoppingBag size={18}/>} {product.stock ? "Add to bag" : "Out of stock"}</button><button className={`detail-wish ${saved ? "saved" : ""}`} aria-label={saved ? "Remove from saved items" : "Save for later"} aria-pressed={saved} disabled={!store.ready || !!busy} onClick={() => void action("wish")}>{busy === "wish" ? <LoaderCircle size={20} className="spin"/> : <Heart size={20} fill={saved ? "currentColor" : "none"}/>}</button></div><p className="purchase-note">Take your time. Save your favorites and come back to them.</p></>;
}
