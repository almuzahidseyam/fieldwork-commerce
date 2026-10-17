import * as repo from "../db/repository";
import { product } from "./catalog";
import { AppError } from "../errors";
import type { Cart, Product } from "../../types/commerce";

export function priceCart(lines: { product: Product; quantity: number }[]): Cart {
  const items = lines.map(line => ({ ...line, total: line.product.price * line.quantity }));
  return { items, subtotal: items.reduce((sum, item) => sum + item.total, 0), count: items.reduce((sum, item) => sum + item.quantity, 0), currency: "USD" };
}
export async function readCart(id: string): Promise<Cart> {
  const rows = await repo.cartRows(id);
  const lines = await Promise.all(rows.map(async r => ({ product: await repo.findProduct(String(r.productSlug)), quantity: Number(r.quantity) })));
  return priceCart(lines.filter((line): line is { product: Product; quantity: number } => !!line.product));
}
export async function writeCart(id: string, slug: string, quantity: number, mode: "add" | "set") {
  const item = await product(slug);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > Math.min(99, item.stock)) throw new AppError(409, "QUANTITY_UNAVAILABLE", item.stock ? `Only ${Math.min(99, item.stock)} available. Please choose a smaller quantity.` : "This item is currently out of stock.");
  await repo.changeCart(id, slug, quantity, item.stock, mode);
  return readCart(id);
}
export async function readWishlist(id: string) {
  const rows = await repo.wishlistRows(id);
  const products = await Promise.all(rows.map(r => repo.findProduct(String(r.productSlug))));
  return { items: products.filter((p): p is Product => !!p) };
}
export async function saveWishlist(id: string, slug: string) { await product(slug); await repo.putWishlist(id, slug); return readWishlist(id); }
