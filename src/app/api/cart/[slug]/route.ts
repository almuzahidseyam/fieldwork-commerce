import { body, currentUser, endpoint, ok } from "@/server/http";
import { readCart, writeCart } from "@/server/services/basket";
import { removeCart } from "@/server/db/repository";
import { quantitySchema, slugSchema } from "@/server/validation";
export const PATCH = endpoint(async request => {
  const { id } = await currentUser(request);
  const slug = slugSchema.parse(request.nextUrl.pathname.split("/").pop());
  return ok(await writeCart(id, slug, (await body(request, quantitySchema)).quantity, "set"));
});
export const DELETE = endpoint(async request => {
  const { id } = await currentUser(request);
  await removeCart(id, slugSchema.parse(request.nextUrl.pathname.split("/").pop()));
  return ok(await readCart(id));
});
