import { createHash, randomBytes, randomUUID } from "node:crypto";
import { BatchWriteCommand, DeleteCommand, GetCommand, PutCommand, QueryCommand, TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { database, tableName } from "./client";
import { AppError } from "../errors";
import type { Category, Product, Profile } from "../../types/commerce";

type Row = Record<string, unknown> & { PK: string; SK: string };
export const userKey = (id: string) => `USER#${id}`;
export const tokenKey = (token: string) => `SESSION#${createHash("sha256").update(token).digest("hex")}`;
const key = (PK: string, SK = "META") => ({ PK, SK });
const expiry = () => Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
async function get(PK: string, SK = "META") {
  return (await database().send(new GetCommand({ TableName: tableName(), Key: key(PK, SK), ConsistentRead: true }))).Item as Row | undefined;
}
async function query(PK: string, prefix?: string, index?: string) {
  const rows: Row[] = [];
  let cursor: Record<string, unknown> | undefined;
  do {
    const result = await database().send(new QueryCommand({
      TableName: tableName(), ...(index ? { IndexName: index } : { ConsistentRead: true }),
      KeyConditionExpression: `#pk = :pk${prefix ? " AND begins_with(#sk, :prefix)" : ""}`,
      ExpressionAttributeNames: { "#pk": index ? "GSI1PK" : "PK", ...(prefix ? { "#sk": index ? "GSI1SK" : "SK" } : {}) },
      ExpressionAttributeValues: { ":pk": PK, ...(prefix ? { ":prefix": prefix } : {}) },
      ...(cursor ? { ExclusiveStartKey: cursor } : {})
    }));
    rows.push(...(result.Items || []) as Row[]);
    cursor = result.LastEvaluatedKey;
  } while (cursor);
  return rows;
}
export async function allProducts(): Promise<Product[]> { return (await query("CATALOG#PRODUCT", undefined, "CatalogIndex")).map(r => r.data as Product); }
export async function allCategories(): Promise<Category[]> { return (await query("CATALOG#CATEGORY", undefined, "CatalogIndex")).map(r => r.data as Category); }
export async function findProduct(slug: string): Promise<Product | undefined> { return (await get(`PRODUCT#${slug}`))?.data as Product | undefined; }
export async function sessionUser(token: string): Promise<string | undefined> {
  if (!/^[a-f0-9]{64}$/.test(token)) return;
  const row = await get(tokenKey(token));
  if (row && Number(row.expiresAt) > Math.floor(Date.now() / 1000)) return String(row.userId);
}
export async function newSession() {
  const token = randomBytes(32).toString("hex");
  const id = randomUUID();
  const profile: Profile = { id, name: "", email: "", createdAt: new Date().toISOString() };
  await database().send(new TransactWriteCommand({
    TransactItems: [
      { Put: { TableName: tableName(), Item: { ...key(userKey(id), "PROFILE"), data: profile, expiresAt: expiry() } } },
      { Put: { TableName: tableName(), Item: { ...key(tokenKey(token)), userId: id, expiresAt: expiry() } } }
    ]
  }));
  return { id, token, profile };
}
export async function getProfile(id: string) { return (await get(userKey(id), "PROFILE"))?.data as Profile | undefined; }
export async function updateProfile(id: string, patch: Pick<Profile, "name" | "email">) {
  const current = await getProfile(id);
  if (!current) throw new AppError(401, "SESSION_EXPIRED", "Your session has expired. Please refresh the page.");
  const data = { ...current, ...patch };
  await database().send(new PutCommand({ TableName: tableName(), Item: { ...key(userKey(id), "PROFILE"), data, expiresAt: expiry() }, ConditionExpression: "attribute_exists(PK)" }));
  return data;
}
export async function cartRows(id: string) { return await query(userKey(id), "CART#"); }
export async function wishlistRows(id: string) { return await query(userKey(id), "WISH#"); }
export async function changeCart(id: string, slug: string, quantity: number, stock: number, mode: "add" | "set") {
  try {
    await database().send(new UpdateCommand({
      TableName: tableName(), Key: key(userKey(id), `CART#${slug}`),
      UpdateExpression: mode === "add" ? "SET quantity = if_not_exists(quantity, :zero) + :qty, productSlug = :slug, expiresAt = :expiry" : "SET quantity = :qty, productSlug = :slug, expiresAt = :expiry",
      ConditionExpression: mode === "add" ? "attribute_not_exists(quantity) OR quantity <= :remaining" : undefined,
      ExpressionAttributeValues: { ":qty": quantity, ":slug": slug, ":expiry": expiry(), ...(mode === "add" ? { ":zero": 0, ":remaining": Math.min(stock, 99) - quantity } : {}) }
    }));
  } catch (error) {
    if ((error as Error).name === "ConditionalCheckFailedException") throw new AppError(409, "QUANTITY_LIMIT", "That quantity is not available. Refresh your bag and try again.");
    throw error;
  }
}
export async function removeCart(id: string, slug: string) { await database().send(new DeleteCommand({ TableName: tableName(), Key: key(userKey(id), `CART#${slug}`) })); }
export async function putWishlist(id: string, slug: string) { await database().send(new PutCommand({ TableName: tableName(), Item: { ...key(userKey(id), `WISH#${slug}`), productSlug: slug, createdAt: new Date().toISOString(), expiresAt: expiry() } })); }
export async function removeWishlist(id: string, slug: string) { await database().send(new DeleteCommand({ TableName: tableName(), Key: key(userKey(id), `WISH#${slug}`) })); }
export async function eraseUser(id: string, token: string) {
  const rows = await query(userKey(id));
  const deletes = [...rows.map(r => ({ DeleteRequest: { Key: key(r.PK, r.SK) } })), { DeleteRequest: { Key: key(tokenKey(token)) } }];
  for (let i = 0; i < deletes.length; i += 25) {
    let pending = deletes.slice(i, i + 25);
    for (let attempt = 0; pending.length && attempt < 8; attempt++) {
      const result = await database().send(new BatchWriteCommand({ RequestItems: { [tableName()]: pending } }));
      pending = (result.UnprocessedItems?.[tableName()] || []) as typeof pending;
      if (pending.length) await new Promise(resolve => setTimeout(resolve, 50 * 2 ** attempt));
    }
    if (pending.length) throw new AppError(503, "RETRY_REQUIRED", "Some data could not be removed. Please try again.");
  }
}
