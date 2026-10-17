# Architecture and DynamoDB data model

Public catalog pages render through server services and repositories. Bag, wishlist, and profile interactions use Route Handlers. Browser components never receive AWS credentials. Identity, prices, stock limits, and subtotals are server-authoritative.

The React provider bootstraps a guest session and serializes browser mutations to avoid stale UI responses. Conditional database writes enforce quantity rules independently of that UI queue.

## Keys and entities

The table uses string `PK` and `SK`. Sparse `CatalogIndex` uses `GSI1PK` and `GSI1SK` with an ALL projection; private rows never appear in that index.

| Entity        | PK                        | SK            | Other attributes                                   |
| ------------- | ------------------------- | ------------- | -------------------------------------------------- |
| Product       | `PRODUCT#<slug>`          | `META`        | `GSI1PK=CATALOG#PRODUCT`, `GSI1SK=<slug>`, `data`  |
| Category      | `CATEGORY#<slug>`         | `META`        | `GSI1PK=CATALOG#CATEGORY`, `GSI1SK=<slug>`, `data` |
| Profile       | `USER#<uuid>`             | `PROFILE`     | `data`, `expiresAt`                                |
| Cart line     | `USER#<uuid>`             | `CART#<slug>` | `productSlug`, `quantity`, `expiresAt`             |
| Wishlist item | `USER#<uuid>`             | `WISH#<slug>` | `productSlug`, `createdAt`, `expiresAt`            |
| Session       | `SESSION#<sha256(token)>` | `META`        | `userId`, `expiresAt`                              |

Product data includes integer-cent price, currency, category, image, description, details, stock, and featured metadata. A saved line references a product, not a price accepted from the client.

## CRUD and access patterns

| Operation                | DynamoDB access                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------- |
| List catalog             | Query corresponding CatalogIndex partition, following LastEvaluatedKey pages        |
| Read product             | Strongly consistent GetItem                                                         |
| Seed products/categories | Conditional PutItem from an authenticated maintenance script                        |
| Update/delete catalog    | Authenticated AWS maintenance; public catalog writes are not exposed                |
| Create user/session      | Transactional profile and hashed-token session Put operations                       |
| Resolve visitor          | Strongly consistent session GetItem and explicit expiry check                       |
| Read/update profile      | Owned PROFILE GetItem / conditional PutItem                                         |
| Read cart/wishlist       | Query owned USER partition with CART# / WISH# sort-key prefix                       |
| Add cart quantity        | Atomic UpdateItem and conditional existing-quantity bound                           |
| Set/remove cart quantity | Validated absolute UpdateItem / DeleteItem                                          |
| Save/unsave wishlist     | PutItem / DeleteItem on one deterministic product key                               |
| Delete guest data        | Query owned partition, batch-delete groups of 25 with retry/backoff, revoke session |

Base-table reads are strongly consistent. Catalog GSI reads are eventually consistent, so new seed data may briefly lag. Bag products are resolved from current database records.

## Business rules

Prices and totals use integer cents. Quantity must be an integer from 1 to the lesser of current stock and 99. Duplicate adds merge into one line. An atomic condition limits the previous quantity, preventing concurrent additions from exceeding checked stock. PATCH sets an absolute quantity.

A bag is not an inventory reservation. Administrative stock changes may invalidate a previously saved quantity; the bag displays a warning. There is no order total, inventory decrement, or payment workflow. Subtotals exclude tax and shipping.

## Security and retention

Guest tokens use 32 random bytes, HttpOnly and SameSite=Lax cookies, and Secure in production. DynamoDB stores token hashes. Request JSON cannot select a user partition. Mutations verify matching Origin/Host, HTTPS or local loopback HTTP, strict schemas, and a 16 KiB JSON size limit.

Unexpected errors expose a generic message and request ID, not database internals or credentials. Sessions expire after 30 days and are rejected immediately after expiry regardless of DynamoDB TTL cleanup. Guest data also carries TTL timestamps for eventual cleanup. TTL deletion is asynchronous, not an exact erasure deadline.

Explicit deletion removes owned data and revokes the session. Partial cleanup failures return a retryable error instead of claiming complete deletion. A guest cookie is shared by tabs in one browser; it does not verify email or provide cross-device sign-in.

## Deployment and trade-offs

The reference IAM trust permits only the named Vercel production project. Short-lived OIDC role credentials avoid static deployment access keys. The runtime role has data access to this table/index only, without table creation, IAM management, or scans.

This small catalog is queried before filtering. High-volume use requires paginated access patterns, dedicated search, bounded retrieval, distributed rate limiting, monitoring, and a recovery policy. These are documented extensions, not represented as completed functionality.
