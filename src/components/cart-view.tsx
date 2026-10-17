"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Heart,
  LockKeyhole,
} from "lucide-react";
import { useStore } from "./store-provider";
import { SessionState } from "./session-state";
import { money } from "@/lib/money";
export function CartView() {
  const store = useStore();
  const [busy, setBusy] = useState("");
  if (!store.ready) return <SessionState />;
  const { cart } = store;
  async function action(slug: string, fn: () => Promise<void>) {
    setBusy(slug);
    try {
      await fn();
    } catch {
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <div className="bag-title">
        <div>
          <span className="eyebrow">GOOD CHOICES, ALL TOGETHER</span>
          <h1>
            Your bag<span>({cart.count})</span>
          </h1>
        </div>
        <Link href="/shop" className="text-link">
          Keep exploring <ArrowUpRight size={18} />
        </Link>
      </div>
      {!cart.items.length ? (
        <div className="empty-state">
          <ShoppingBag size={42} />
          <h2>A little room for something good.</h2>
          <p>Your bag is empty. Find an everyday favorite to get started.</p>
          <Link href="/shop" className="button button-dark">
            Explore the collection <ArrowUpRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section aria-label="Items in your bag" className="cart-items">
            <div className="cart-column-labels">
              <span>YOUR ESSENTIALS</span>
              <span>QUANTITY & TOTAL</span>
            </div>
            {cart.items.map(({ product: p, quantity, total }) => (
              <article
                className="cart-item"
                key={p.slug}
                aria-busy={busy === p.slug}
              >
                <Link
                  className="cart-product-image"
                  href={`/products/${p.slug}`}
                >
                  <Image src={p.image} alt={p.name} fill sizes="140px" />
                </Link>
                <div className="cart-product-info">
                  <span className="eyebrow">{p.category}</span>
                  <h2>
                    <Link href={`/products/${p.slug}`}>{p.name}</Link>
                  </h2>
                  <p>{p.color}</p>
                  <span>{money(p.price)} each</span>
                  {quantity > p.stock && (
                    <p className="inline-error">
                      Only {p.stock} currently available. Please adjust your
                      quantity.
                    </p>
                  )}
                  <div className="cart-item-actions">
                    <button
                      disabled={!!busy}
                      onClick={() =>
                        void action(p.slug, async () => {
                          if (
                            !store.wishlist.items.some((x) => x.slug === p.slug)
                          )
                            await store.toggleWish(p.slug);
                          await store.remove(p.slug);
                        })
                      }
                    >
                      <Heart size={13} />
                      Save for later
                    </button>
                    <button
                      aria-label={`Remove ${p.name} from bag`}
                      disabled={!!busy}
                      onClick={() =>
                        void action(p.slug, () => store.remove(p.slug))
                      }
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                </div>
                <div className="cart-quantity">
                  <div className="quantity-control">
                    <button
                      aria-label={`Decrease ${p.name} quantity`}
                      disabled={quantity <= 1 || !!busy}
                      onClick={() =>
                        void action(p.slug, () =>
                          store.quantity(p.slug, quantity - 1),
                        )
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <output aria-label={`${p.name} quantity`}>
                      {quantity}
                    </output>
                    <button
                      aria-label={`Increase ${p.name} quantity`}
                      disabled={quantity >= Math.min(p.stock, 99) || !!busy}
                      onClick={() =>
                        void action(p.slug, () =>
                          store.quantity(p.slug, quantity + 1),
                        )
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <strong>{money(total)}</strong>
                </div>
              </article>
            ))}
            <Link href="/shop" className="text-link back-shopping">
              <ArrowLeft size={17} /> Back to the good things
            </Link>
          </section>
          <aside className="bag-summary">
            <span className="eyebrow">THE SHORT VERSION</span>
            <h2>Your bag, at a glance.</h2>
            <div className="summary-row">
              <span>Items ({cart.count})</span>
              <span>{money(cart.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping & taxes</span>
              <span>Not calculated</span>
            </div>
            <div className="summary-total">
              <span>Subtotal</span>
              <strong>
                {money(cart.subtotal)} <small>USD</small>
              </strong>
            </div>
            <p className="demo-note">
              <LockKeyhole size={17} />
              <span>
                This is a demonstration store. Your bag is saved, but orders and
                payments are not available.
              </span>
            </p>
            <Link href="/shop" className="button button-dark full-width">
              Keep exploring <ArrowUpRight size={18} />
            </Link>
            <span className="summary-footnote">
              Good things are worth a second look.
            </span>
          </aside>
        </div>
      )}
    </>
  );
}
