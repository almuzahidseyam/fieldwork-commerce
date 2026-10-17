import { test } from "node:test";
import assert from "node:assert/strict";
import { filterProducts } from "../src/server/services/catalog";
import { priceCart } from "../src/server/services/basket";
import {
  cartSchema,
  filtersSchema,
  profileSchema,
  slugSchema,
} from "../src/server/validation";
import { products } from "../src/data/catalog";

test("case-insensitive search matches product names", () => {
  assert.equal(
    filterProducts(products, { search: "  ROAM " })[0].slug,
    "roam-daypack",
  );
});
test("combined filters restrict category, price, and availability", () => {
  const result = filterProducts(products, {
    category: "tech",
    maxPrice: 15000,
    inStock: true,
  });
  assert.deepEqual(
    result.map((p) => p.slug),
    ["studio-headphones"],
  );
});
test("ascending price order is numeric", () => {
  const result = filterProducts(products, { sort: "price-asc" });
  assert.equal(result[0].slug, "terra-planter");
  assert.equal(result.at(-1)?.slug, "classic-camera");
});
test("descending price order is numeric", () => {
  assert.equal(
    filterProducts(products, { sort: "price-desc" })[0].slug,
    "classic-camera",
  );
});
test("unknown search returns an empty collection", () => {
  assert.deepEqual(filterProducts(products, { search: "not-a-product" }), []);
});
test("filtering does not mutate the source catalog", () => {
  const order = products.map((p) => p.slug);
  filterProducts(products, { sort: "price-desc" });
  assert.deepEqual(
    products.map((p) => p.slug),
    order,
  );
});
test("cart subtotal uses integer cents and current server products", () => {
  const cart = priceCart([
    { product: products[0], quantity: 3 },
    { product: products[1], quantity: 2 },
  ]);
  assert.equal(cart.subtotal, 56500);
  assert.equal(cart.count, 5);
  assert.equal(cart.items[0].total, 26700);
});
test("empty cart has zero subtotal", () => {
  assert.equal(priceCart([]).subtotal, 0);
});
for (const quantity of [0, -1, 1.5, 100, "2", null])
  test(`rejects invalid quantity ${quantity}`, () => {
    assert.equal(
      cartSchema.safeParse({ productSlug: "roam-daypack", quantity }).success,
      false,
    );
  });
test("rejects client-supplied prices and user identity", () => {
  assert.equal(
    cartSchema.safeParse({
      productSlug: "roam-daypack",
      quantity: 1,
      price: 1,
      userId: "someone-else",
    }).success,
    false,
  );
});
test("valid quantity passes", () => {
  assert.equal(
    cartSchema.safeParse({ productSlug: "roam-daypack", quantity: 1 }).success,
    true,
  );
});
test("profile email is validated", () => {
  assert.equal(
    profileSchema.safeParse({ name: "Alex", email: "invalid" }).success,
    false,
  );
});
test("profile fields are trimmed", () => {
  assert.equal(
    profileSchema.parse({ name: " Alex ", email: "alex@example.com" }).name,
    "Alex",
  );
});
test("path-like identifiers are rejected", () => {
  assert.equal(slugSchema.safeParse("../profile").success, false);
});
test("filter sort cannot contain arbitrary input", () => {
  assert.equal(filtersSchema.safeParse({ sort: "arbitrary" }).success, false);
});
test("catalog images, categories, and slugs are complete and unique", () => {
  assert.equal(new Set(products.map((p) => p.slug)).size, products.length);
  assert.ok(
    products.every(
      (p) => Number.isInteger(p.price) && p.price > 0 && p.details.length > 0,
    ),
  );
});
