"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, X, AlertCircle } from "lucide-react";
import type { Cart, Profile, Wishlist } from "@/types/commerce";

const emptyCart: Cart = { items: [], count: 0, subtotal: 0, currency: "USD" };
export async function request<T>(path: string, method = "GET", payload?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, { method, credentials: "same-origin", headers: payload ? { "Content-Type": "application/json" } : {}, ...(payload ? { body: JSON.stringify(payload) } : {}), cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.fields?.[0]?.message || result.error?.message || "Something went wrong. Please try again.");
  return result.data;
}
type Store = {
  cart: Cart; wishlist: Wishlist; profile: Profile | null; ready: boolean; loading: boolean; error: string;
  add: (slug: string, quantity?: number) => Promise<void>;
  quantity: (slug: string, quantity: number) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  toggleWish: (slug: string) => Promise<void>;
  refresh: () => Promise<void>;
  saveProfile: (value: { name: string; email: string }) => Promise<void>;
  eraseProfile: () => Promise<void>;
  notify: (message: string, error?: boolean) => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [wishlist, setWishlist] = useState<Wishlist>({ items: [] });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; error: boolean } | null>(null);
  const init = useRef<Promise<void> | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const notify = useCallback((message: string, error = false) => setToast({ message, error }), []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), 5000); return () => clearTimeout(timer); }, [toast]);
  const refresh = useCallback(async () => {
    if (init.current) return init.current;
    setLoading(true); setError("");
    const promise = (async () => {
      try {
        await request("/session", "POST");
        const [bag, saved, user] = await Promise.all([request<Cart>("/cart"), request<Wishlist>("/wishlist"), request<Profile>("/profile")]);
        setCart(bag); setWishlist(saved); setProfile(user); setReady(true);
      } catch (error) { setError((error as Error).message); setReady(false); }
      finally { setLoading(false); init.current = null; }
    })();
    init.current = promise;
    return promise;
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const run = (action: () => Promise<void>) => {
    const result = queue.current.catch(() => {}).then(async () => {
      if (!ready) throw new Error("Your session is not ready. Please refresh and try again.");
      await action();
    });
    queue.current = result;
    return result.catch(error => { notify((error as Error).message, true); throw error; });
  };
  const add = (slug: string, quantity = 1) => run(async () => { setCart(await request<Cart>("/cart", "POST", { productSlug: slug, quantity })); notify("Added to your bag"); });
  const quantity = (slug: string, quantity: number) => run(async () => { setCart(await request<Cart>(`/cart/${slug}`, "PATCH", { quantity })); });
  const remove = (slug: string) => run(async () => { setCart(await request<Cart>(`/cart/${slug}`, "DELETE")); notify("Removed from your bag"); });
  const toggleWish = (slug: string) => run(async () => {
    // Fetch current saved items inside the queue so repeated clicks remain ordered.
    const current = await request<Wishlist>("/wishlist");
    const exists = current.items.some(p => p.slug === slug);
    setWishlist(await request<Wishlist>(exists ? `/wishlist/${slug}` : "/wishlist", exists ? "DELETE" : "POST", exists ? undefined : { productSlug: slug }));
    notify(exists ? "Removed from saved items" : "Saved for later");
  });
  const saveProfile = (value: { name: string; email: string }) => run(async () => { setProfile(await request<Profile>("/profile", "PATCH", value)); notify("Your profile has been saved"); });
  const eraseProfile = () => run(async () => { await request("/profile", "DELETE"); setReady(false); setCart(emptyCart); setWishlist({ items: [] }); setProfile(null); await refresh(); notify("Your previous profile and saved items have been deleted"); });
  return <Context.Provider value={{ cart, wishlist, profile, ready, loading, error, add, quantity, remove, toggleWish, refresh, saveProfile, eraseProfile, notify }}>
    {children}
    {toast && <div className={`toast ${toast.error ? "toast-error" : ""}`} role={toast.error ? "alert" : "status"}>{toast.error ? <AlertCircle size={20}/> : <Check size={20}/>}<span>{toast.message}</span><button aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={17}/></button></div>}
  </Context.Provider>;
}
export function useStore() { const store = useContext(Context); if (!store) throw new Error("StoreProvider is missing"); return store; }
