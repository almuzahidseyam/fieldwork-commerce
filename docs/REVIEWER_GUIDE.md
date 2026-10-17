# Reviewer walkthrough

Use sample contact details. This demonstration does not accept orders or payments.

1. Browse the homepage and categories. Search for `roam` and combine price, category, stock, and sort filters; then reset.
2. Open Roam Daypack and add quantity 2. Add it once more: one line, quantity 3, subtotal $267.
3. Refresh the bag to confirm database persistence. Change quantity and remove a line.
4. Inspect the out-of-stock Pocket Speaker. Both its UI and API prevent adding it.
5. Save a product using the heart, open saved items, refresh, and remove it. Repeated saves through the API keep one record.
6. Open Your profile, save `Demo Reviewer` / `reviewer@example.com`, then refresh.
7. Use a separate browser/private session. Its bag, wishlist, and profile are isolated. Tabs sharing one browser cookie share their guest session.
8. Delete the guest profile with the explicit confirmation. Previous saved data is removed, and a fresh session starts.
9. Test mobile/tablet/desktop layouts, menu, keyboard controls, empty states, and loading/error interfaces.
10. Visit `/products/not-a-real-product` and a missing route to inspect not-found handling.

## Engineering entry points

- `src/server/services/basket.ts`: authoritative totals and stock rules.
- `src/server/db/repository.ts`: owned partitions, conditional writes, idempotent keys, transactional session creation.
- `src/server/http.ts` / `validation.ts`: origin checks, schemas, error envelopes, and cookies.
- `tests/integration/api.test.ts`: real HTTP-to-database workflow, isolation, and concurrent quantity tests.
- `infra/cloudformation.yaml`: keys, index, TTL, fixed capacity, and scoped deployment role.
- `docs/ARCHITECTURE.md`: CRUD/access patterns, consistency, security, and limitations.

The requested storefront, user data, cart, wishlist, backend, responsive states, validation, and not-found handling are implemented using Next.js, React, TypeScript, Tailwind, and DynamoDB. Production-style refers to these engineering practices; this educational demo is not represented as a commercial payment-capable storefront.
