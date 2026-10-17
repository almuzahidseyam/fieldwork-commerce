# Deployment notes

- Public application: https://fieldwork-commerce.vercel.app
- Repository: https://github.com/almuzahidseyam/fieldwork-commerce
- Vercel project: `fieldwork-commerce`, Node.js 24, production function region `syd1`.
- AWS DynamoDB region: `ap-southeast-2`.
- Table: `fieldwork-commerce`, PK/SK string keys, sparse `CatalogIndex` on GSI1PK/GSI1SK.
- Table and index each use fixed 5 RCU / 5 WCU; autoscaling is off. Encryption uses the AWS-owned key.
- TTL uses `expiresAt` for guest data. Catalog records do not expire.
- Runtime role: `fieldwork-vercel-commerce`; trust is restricted to the named Vercel team, project, and production environment. Its inline policy permits data operations only on this table/index.
- Production variables: `AWS_REGION`, `DYNAMODB_TABLE_NAME`, `AWS_ROLE_ARN`. There are no static AWS access keys in the deployed application.
- GitHub is connected to Vercel; pushes to the production branch trigger deployments. Preview deployments intentionally have no production database access under this trust policy.

The database, index, TTL, OIDC provider, and role were configured through the AWS console. `infra/cloudformation.yaml` is a reproducible reference for a new environment; the existing manually created resources are not managed by a CloudFormation stack. Do not deploy the template over the same resource names without planning an import or selecting a fresh environment.

## Release checks

Review CI, build output, required variables, and current role scope. After deployment, verify catalog reads and an isolated session's cart/wishlist/profile workflow. Do not populate the demo with real customer data.

## Rollback

If catalog reads or a critical bag/wishlist flow fail after a release, use Vercel's deployment history to promote the last verified deployment. If a first release has no healthy predecessor, pause public access while correcting configuration. Do not delete the database as a rollback step.

No destructive data migration was part of this release. A code rollback does not revert user data or catalog maintenance. Keep future schema changes compatible with the previous deployed application or prepare a separate recovery procedure before release.
