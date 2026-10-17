import nextEnv from "@next/env";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { database, tableName } from "../src/server/db/client";
import { categories, products } from "../src/data/catalog";
nextEnv.loadEnvConfig(process.cwd());
let created = 0;
for (const [kind, data] of [...products.map(p => ["PRODUCT", p] as const), ...categories.map(c => ["CATEGORY", c] as const)]) {
  try {
    await database().send(new PutCommand({ TableName: tableName(), Item: { PK: `${kind}#${data.slug}`, SK: "META", GSI1PK: `CATALOG#${kind}`, GSI1SK: data.slug, data }, ConditionExpression: "attribute_not_exists(PK)" }));
    created++;
  } catch (error) { if ((error as Error).name !== "ConditionalCheckFailedException") throw error; }
}
console.log(`Created ${created} catalog records; existing records preserved.`);
