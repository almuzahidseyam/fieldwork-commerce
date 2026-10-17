import { body, COOKIE, currentUser, endpoint, ok } from "@/server/http";
import { eraseUser, getProfile, updateProfile } from "@/server/db/repository";
import { profileSchema } from "@/server/validation";
export const GET = endpoint(async (request) =>
  ok(await getProfile((await currentUser(request)).id)),
);
export const PATCH = endpoint(async (request) =>
  ok(
    await updateProfile(
      (await currentUser(request)).id,
      await body(request, profileSchema),
    ),
  ),
);
export const DELETE = endpoint(async (request) => {
  const { id, token } = await currentUser(request);
  await eraseUser(id, token);
  const response = ok({ deleted: true });
  response.cookies.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
});
