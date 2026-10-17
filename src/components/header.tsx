"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Search, Heart, ShoppingBag, UserRound, Menu, X, ArrowRight } from "lucide-react";
import { useStore } from "./store-provider";

export function Header() {
  const store = useStore();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <>
    <div className="announcement">Thoughtful essentials. A little more everyday. <Link href="/shop">Explore the collection <ArrowUpRight size={12}/></Link></div>
    <header className="site-header"><div className="nav-shell">
      <Link href="/" className="wordmark" aria-label="Fieldwork home">fieldwork<span>®</span></Link>
      <nav aria-label="Main navigation" className="desktop-nav">
        <Link href="/shop" className={pathname === "/shop" ? "active" : ""}>Shop all</Link>
        <Link href="/shop?category=carry">Carry</Link><Link href="/shop?category=wear">Wear</Link><Link href="/shop?category=home">Home</Link><Link href="/shop?category=tech">Tech</Link>
      </nav>
      <div className="nav-actions">
        <Link href="/shop?search=" aria-label="Search products"><Search size={20}/></Link>
        <Link href="/account" aria-label="Your profile" className="profile-link"><UserRound size={20}/></Link>
        <Link href="/wishlist" aria-label={`Saved items, ${store.wishlist.items.length}`}><Heart size={20}/>{store.wishlist.items.length > 0 && <span className="count-dot">{store.wishlist.items.length}</span>}</Link>
        <Link href="/cart" aria-label={`Shopping bag, ${store.cart.count} items`} className="bag-link"><ShoppingBag size={20}/><span className="bag-number">{store.cart.count}</span></Link>
        <button className="mobile-menu-button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
    </div>
    {open && <nav className="mobile-nav" aria-label="Mobile navigation">{[["Shop all", "/shop"], ["Carry", "/shop?category=carry"], ["Wear", "/shop?category=wear"], ["Home", "/shop?category=home"], ["Tech", "/shop?category=tech"], ["Your profile", "/account"]].map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}<ArrowRight size={18}/></Link>)}</nav>}
    </header>
    {store.error && <div className="connection-banner" role="alert">Your bag could not connect. <button onClick={() => void store.refresh()}>Try again</button></div>}
  </>;
}
