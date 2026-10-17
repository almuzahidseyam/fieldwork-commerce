import { allCategories, allProducts, findProduct } from "../db/repository";
import { AppError } from "../errors";
import type { Product, ProductFilters } from "../../types/commerce";

export function filterProducts(products: Product[], filters: ProductFilters) {
  const search = filters.search?.trim().toLowerCase();
  const result = products.filter(
    (p) =>
      (!search ||
        `${p.name} ${p.description} ${p.color}`
          .toLowerCase()
          .includes(search)) &&
      (!filters.category || p.category === filters.category) &&
      (filters.maxPrice === undefined || p.price <= filters.maxPrice) &&
      (!filters.inStock || p.stock > 0),
  );
  return result.sort((a, b) =>
    filters.sort === "price-asc"
      ? a.price - b.price
      : filters.sort === "price-desc"
        ? b.price - a.price
        : filters.sort === "name"
          ? a.name.localeCompare(b.name)
          : Number(b.featured) - Number(a.featured) ||
            a.name.localeCompare(b.name),
  );
}
export async function catalog(filters: ProductFilters = {}) {
  return filterProducts(await allProducts(), filters);
}
export const categoryList = allCategories;
export async function product(slug: string) {
  const result = await findProduct(slug);
  if (!result)
    throw new AppError(
      404,
      "PRODUCT_NOT_FOUND",
      "We could not find that product.",
    );
  return result;
}
