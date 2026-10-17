import { endpoint, ok } from "@/server/http";
import { product } from "@/server/services/catalog";
import { slugSchema } from "@/server/validation";
export const GET = endpoint(async (request) =>
  ok(
    await product(slugSchema.parse(request.nextUrl.pathname.split("/").pop())),
  ),
);
