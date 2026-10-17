# HTTP API

Endpoints are under `/api`. Success: `{ "data": ... }`. Failure: `{ "error": { "code", "message", "requestId", "fields"? } }`.

Catalog reads are public. Private operations require the HttpOnly cookie from `POST /api/session`. Mutations require a matching Origin header; JSON bodies require `Content-Type: application/json`. Identity comes only from the session.

| Method | Path              | Purpose/body                                                     |
| ------ | ----------------- | ---------------------------------------------------------------- |
| POST   | `/session`        | Create or retain guest session                                   |
| GET    | `/products`       | Filters: search, category, sort, maxPrice in cents, inStock=true |
| GET    | `/products/:slug` | Product, or structured 404                                       |
| GET    | `/categories`     | Categories                                                       |
| GET    | `/cart`           | Current bag lines, prices, count, and subtotal                   |
| POST   | `/cart`           | `{ "productSlug": "roam-daypack", "quantity": 1 }`               |
| PATCH  | `/cart/:slug`     | `{ "quantity": 2 }`, absolute quantity                           |
| DELETE | `/cart/:slug`     | Remove line                                                      |
| GET    | `/wishlist`       | Saved products                                                   |
| POST   | `/wishlist`       | `{ "productSlug": "roam-daypack" }`, idempotent                  |
| DELETE | `/wishlist/:slug` | Remove saved product                                             |
| GET    | `/profile`        | Current profile                                                  |
| PATCH  | `/profile`        | `{ "name": "Alex Morgan", "email": "alex@example.com" }`         |
| DELETE | `/profile`        | Delete owned data and revoke session                             |

Sort values: `featured`, `price-asc`, `price-desc`, `name`. The compact catalog API has no client cursor; repositories handle DynamoDB query pagination internally.

```bash
curl -c cookies.txt -X POST -H 'Origin: http://127.0.0.1:3001' http://127.0.0.1:3001/api/session
curl -b cookies.txt -H 'Origin: http://127.0.0.1:3001' -H 'Content-Type: application/json' -d '{"productSlug":"roam-daypack","quantity":2}' http://127.0.0.1:3001/api/cart
curl -b cookies.txt http://127.0.0.1:3001/api/cart
```

Two Roam Daypacks produce quantity 2 and subtotal 17800 cents ($178). Product records in responses contain the full database product data.

| Status | Meaning                                                 |
| ------ | ------------------------------------------------------- |
| 400    | Invalid JSON, field, slug, or filters                   |
| 401    | Missing, invalid, expired, or revoked session           |
| 403    | Missing/mismatched mutation origin                      |
| 404    | Product not found                                       |
| 409    | Unavailable quantity or concurrent stock-limit conflict |
| 413    | JSON exceeds 16 KiB                                     |
| 415    | JSON content type required                              |
| 503    | Service unavailable or incomplete cleanup; retry later  |

There is no distributed application rate limiter. Platform and database throughput limits are not substitutes for visitor abuse controls. Add a shared limiter/WAF before substantial public traffic. Integration tests create/delete only their own guest sessions; do not target real customer environments.
