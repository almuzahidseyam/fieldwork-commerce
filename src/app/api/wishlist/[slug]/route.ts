import { currentUser, endpoint, ok } from "@/server/http";
import { readWishlist } from "@/server/services/basket";
import { removeWishlist } from "@/server/db/repository";
import { slugSchema } from "@/server/validation";
export const DELETE = endpoint(async (request) => {
  const { id } = await currentUser(request);
  await removeWishlist(
    id,
    slugSchema.parse(request.nextUrl.pathname.split("/").pop()),
  );
  return ok(await readWishlist(id));
});
