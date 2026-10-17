import { body, currentUser, endpoint, ok } from "@/server/http";
import { readWishlist, saveWishlist } from "@/server/services/basket";
import { wishlistSchema } from "@/server/validation";
export const GET = endpoint(async request => ok(await readWishlist((await currentUser(request)).id)));
export const POST = endpoint(async request => ok(await saveWishlist((await currentUser(request)).id, (await body(request, wishlistSchema)).productSlug)));
