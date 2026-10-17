import { body, currentUser, endpoint, ok } from "@/server/http";
import { readCart, writeCart } from "@/server/services/basket";
import { cartSchema } from "@/server/validation";
export const GET = endpoint(async (request) =>
  ok(await readCart((await currentUser(request)).id)),
);
export const POST = endpoint(async (request) => {
  const { id } = await currentUser(request);
  const { productSlug, quantity } = await body(request, cartSchema);
  return ok(await writeCart(id, productSlug, quantity, "add"));
});
