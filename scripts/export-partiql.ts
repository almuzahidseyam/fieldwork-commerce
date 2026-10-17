import { mkdirSync, writeFileSync } from "node:fs";
import { products, categories } from "../src/data/catalog";
function literal(value: unknown): string {
  if (typeof value === "string") return `'${value.replaceAll("'", "''")}'`;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) return `[${value.map(literal).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .map(([k, v]) => `${literal(k)}:${literal(v)}`)
      .join(",")}}`;
  return "NULL";
}
const statements = [
  ...products.map((p) => ["PRODUCT", p] as const),
  ...categories.map((c) => ["CATEGORY", c] as const),
].map(
  ([kind, data]) =>
    `INSERT INTO "fieldwork-commerce" VALUE ${literal({ PK: `${kind}#${data.slug}`, SK: "META", GSI1PK: `CATALOG#${kind}`, GSI1SK: data.slug, data })}`,
);
mkdirSync(".data", { recursive: true });
writeFileSync(".data/cloud-seed.json", JSON.stringify(statements, null, 2));
console.log(
  `Exported ${statements.length} seed statements to ignored .data/cloud-seed.json`,
);
