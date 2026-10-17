import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

let singleton: DynamoDBDocumentClient | undefined;
export function tableName() {
  const name = process.env.DYNAMODB_TABLE_NAME;
  if (!name) throw new Error("DYNAMODB_TABLE_NAME is not configured");
  return name;
}
export function database() {
  if (!singleton) {
    const endpoint = process.env.DYNAMODB_ENDPOINT;
    if (endpoint && process.env.VERCEL_ENV === "production")
      throw new Error("Production must use AWS DynamoDB");
    singleton = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: process.env.AWS_REGION || "us-east-1",
        ...(endpoint
          ? {
              endpoint,
              credentials: { accessKeyId: "local", secretAccessKey: "local" },
            }
          : process.env.AWS_ROLE_ARN
            ? {
                credentials: awsCredentialsProvider({
                  roleArn: process.env.AWS_ROLE_ARN,
                }),
              }
            : {}),
        maxAttempts: 3,
      }),
      { marshallOptions: { removeUndefinedValues: true } },
    );
  }
  return singleton;
}
