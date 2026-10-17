import { test } from "node:test";
import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3001";
type Result = { response: Response; json: any };
function client() {
  let cookie = "";
  return async (path: string, method = "GET", data?: unknown, origin = base): Promise<Result> => {
    const response = await fetch(`${base}/api${path}`, { method, headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...(data !== undefined ? { "Content-Type": "application/json" } : {}) }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
    const setCookie = response.headers.get("set-cookie"); if (setCookie) cookie = setCookie.split(";")[0];
    return { response, json: await response.json() };
  };
}
test("database-backed API workflow and adversarial requests", async t => {
  const alice = client(), bob = client();
  t.after(async () => { await alice("/profile", "DELETE"); await bob("/profile", "DELETE"); });
  await t.test("private data requires a session", async () => { assert.equal((await alice("/cart")).response.status, 401); });
  await t.test("cross-origin requests cannot create a session", async () => { assert.equal((await alice("/session", "POST", undefined, "https://untrusted.example")).response.status, 403); });
  await t.test("creates separate secure guest sessions", async () => { const a = await alice("/session", "POST"); assert.equal(a.response.status, 201); assert.match(a.response.headers.get("set-cookie") || "", /HttpOnly/i); assert.match(a.response.headers.get("set-cookie") || "", /SameSite=Lax/i); assert.equal((await bob("/session", "POST")).response.status, 201); });
  await t.test("session bootstrap is idempotent", async () => { assert.equal((await alice("/session", "POST")).response.status, 200); });
  await t.test("catalog and categories come from the database", async () => { assert.equal((await alice("/products")).json.data.length, 12); assert.equal((await alice("/categories")).json.data.length, 4); });
  await t.test("product API supports combined filtering", async () => { const r = await alice("/products?category=tech&inStock=true&maxPrice=15000"); assert.deepEqual(r.json.data.map((p: any) => p.slug), ["studio-headphones"]); });
  await t.test("unknown product has a structured 404", async () => { const r = await alice("/products/missing-product"); assert.equal(r.response.status, 404); assert.equal(r.json.error.code, "PRODUCT_NOT_FOUND"); });
  await t.test("invalid filters return 400", async () => { assert.equal((await alice("/products?sort=garbage")).response.status, 400); });
  await t.test("adds one line and calculates server-side subtotal", async () => { const r = await alice("/cart", "POST", { productSlug: "roam-daypack", quantity: 2 }); assert.equal(r.response.status, 200); assert.equal(r.json.data.count, 2); assert.equal(r.json.data.subtotal, 17800); });
  await t.test("duplicate cart items merge quantities", async () => { const r = await alice("/cart", "POST", { productSlug: "roam-daypack", quantity: 1 }); assert.equal(r.json.data.items.length, 1); assert.equal(r.json.data.count, 3); });
  await t.test("separate user cannot see another user's bag", async () => { assert.equal((await bob("/cart")).json.data.count, 0); });
  await t.test("quantity PATCH sets an absolute value", async () => { const r = await alice("/cart/roam-daypack", "PATCH", { quantity: 4 }); assert.equal(r.json.data.count, 4); assert.equal(r.json.data.subtotal, 35600); });
  await t.test("rejects out-of-stock items", async () => { assert.equal((await alice("/cart", "POST", { productSlug: "pocket-speaker", quantity: 1 })).response.status, 409); });
  await t.test("rejects quantity beyond available stock", async () => { assert.equal((await alice("/cart/roam-daypack", "PATCH", { quantity: 19 })).response.status, 409); });
  await t.test("rejects invalid, fractional and negative quantities", async () => { for (const quantity of [-1, 0, 1.5, "3"]) assert.equal((await alice("/cart", "POST", { productSlug: "roam-daypack", quantity })).response.status, 400); });
  await t.test("rejects client price and ownership overrides", async () => { assert.equal((await alice("/cart", "POST", { productSlug: "roam-daypack", quantity: 1, price: 1, userId: "other" })).response.status, 400); });
  await t.test("atomic increments cannot exceed stock under concurrency", async () => { await alice("/cart/roam-daypack", "PATCH", { quantity: 17 }); const results = await Promise.all(Array.from({ length: 5 }, () => alice("/cart", "POST", { productSlug: "roam-daypack", quantity: 1 }))); assert.equal(results.filter(r => r.response.status === 200).length, 1); assert.equal((await alice("/cart")).json.data.count, 18); });
  await t.test("wishlist add is idempotent and isolated", async () => { await alice("/wishlist", "POST", { productSlug: "studio-headphones" }); const r = await alice("/wishlist", "POST", { productSlug: "studio-headphones" }); assert.equal(r.json.data.items.length, 1); assert.equal((await bob("/wishlist")).json.data.items.length, 0); });
  await t.test("missing products cannot enter wishlist", async () => { assert.equal((await alice("/wishlist", "POST", { productSlug: "missing-product" })).response.status, 404); });
  await t.test("invalid profile data is rejected", async () => { assert.equal((await alice("/profile", "PATCH", { name: "A", email: "bad" })).response.status, 400); });
  await t.test("profile data persists and remains private", async () => { assert.equal((await alice("/profile", "PATCH", { name: "Test Reviewer", email: "reviewer@example.com" })).response.status, 200); assert.equal((await alice("/profile")).json.data.name, "Test Reviewer"); assert.equal((await bob("/profile")).json.data.name, ""); });
  await t.test("wishlist and cart removal persist", async () => { assert.equal((await alice("/wishlist/studio-headphones", "DELETE")).json.data.items.length, 0); assert.equal((await alice("/cart/roam-daypack", "DELETE")).json.data.count, 0); });
  await t.test("deleting a profile revokes its session and removes saved data", async () => { await alice("/cart", "POST", { productSlug: "roam-daypack", quantity: 1 }); await alice("/wishlist", "POST", { productSlug: "roam-daypack" }); assert.equal((await alice("/profile", "DELETE")).response.status, 200); assert.equal((await alice("/cart")).response.status, 401); assert.equal((await alice("/session", "POST")).response.status, 201); assert.equal((await alice("/cart")).json.data.count, 0); assert.equal((await alice("/wishlist")).json.data.items.length, 0); });
});
