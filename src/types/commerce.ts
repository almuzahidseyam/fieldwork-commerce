export type Category = {
  slug: string;
  name: string;
  description: string;
  image: string;
};
export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  currency: "USD";
  image: string;
  description: string;
  details: string[];
  color: string;
  stock: number;
  featured: boolean;
  badge?: string;
};
export type Profile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};
export type CartLine = { product: Product; quantity: number; total: number };
export type Cart = {
  items: CartLine[];
  subtotal: number;
  count: number;
  currency: "USD";
};
export type Wishlist = { items: Product[] };
export type ProductFilters = {
  search?: string;
  category?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "name";
  maxPrice?: number;
  inStock?: boolean;
};
