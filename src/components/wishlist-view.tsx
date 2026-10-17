"use client";
import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
import { useStore } from "./store-provider";
import { SessionState } from "./session-state";
import { ProductGrid } from "./product-grid";
export function WishlistView() {
  const store = useStore();
  if (!store.ready) return <SessionState/>;
  return <><div className="bag-title"><div><span className="eyebrow">A LITTLE SOMETHING FOR LATER</span><h1>Your saved things<span>({store.wishlist.items.length})</span></h1></div><Link href="/shop" className="text-link">Find more favorites <ArrowUpRight size={18}/></Link></div><p className="saved-intro">Good finds, kept in one place. Come back whenever you’re ready.</p>{store.wishlist.items.length ? <ProductGrid products={store.wishlist.items}/> : <div className="empty-state"><Heart size={42}/><h2>Something will catch your eye.</h2><p>Tap the heart on an essential to save it here for later.</p><Link href="/shop" className="button button-dark">Find your favorites <ArrowUpRight size={18}/></Link></div>}</>;
}
