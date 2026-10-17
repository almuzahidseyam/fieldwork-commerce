import { endpoint, ok } from "@/server/http";
import { catalog } from "@/server/services/catalog";
import { filtersSchema } from "@/server/validation";
export const GET = endpoint(async (request) =>
  ok(
    await catalog(
      filtersSchema.parse(Object.fromEntries(request.nextUrl.searchParams)),
    ),
  ),
);
