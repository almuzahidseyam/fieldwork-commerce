import nextEnv from "@next/env";
import { CreateTableCommand, DescribeTableCommand, UpdateTimeToLiveCommand, waitUntilTableExists } from "@aws-sdk/client-dynamodb";
import { database, tableName } from "../src/server/db/client";
nextEnv.loadEnvConfig(process.cwd());
const client = database();
try {
  await client.send(new DescribeTableCommand({ TableName: tableName() }));
  console.log("Table already exists; no changes made.");
} catch (error) {
  if ((error as Error).name !== "ResourceNotFoundException") throw error;
  await client.send(new CreateTableCommand({
    TableName: tableName(), BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [ { AttributeName: "PK", AttributeType: "S" }, { AttributeName: "SK", AttributeType: "S" }, { AttributeName: "GSI1PK", AttributeType: "S" }, { AttributeName: "GSI1SK", AttributeType: "S" } ],
    KeySchema: [{ AttributeName: "PK", KeyType: "HASH" }, { AttributeName: "SK", KeyType: "RANGE" }],
    GlobalSecondaryIndexes: [{ IndexName: "CatalogIndex", KeySchema: [{ AttributeName: "GSI1PK", KeyType: "HASH" }, { AttributeName: "GSI1SK", KeyType: "RANGE" }], Projection: { ProjectionType: "ALL" } }]
  }));
  await waitUntilTableExists({ client: client as never, maxWaitTime: 120 }, { TableName: tableName() });
  if (!process.env.DYNAMODB_ENDPOINT) await client.send(new UpdateTimeToLiveCommand({ TableName: tableName(), TimeToLiveSpecification: { AttributeName: "expiresAt", Enabled: true } }));
  console.log("Created table and catalog index.");
}
