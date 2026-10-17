import { endpoint, ok } from "@/server/http";
import { categoryList } from "@/server/services/catalog";
export const GET = endpoint(async () => ok(await categoryList()));
