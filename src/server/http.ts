import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { AppError } from "./errors";
import { newSession, sessionUser } from "./db/repository";

export const COOKIE = "fieldwork_session";
export function ok(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status, headers: { "Cache-Control": "no-store" } });
}
export function endpoint(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
        const origin = request.headers.get("origin");
        let validOrigin = false;
        try {
          const url = new URL(origin || "");
          validOrigin = url.host === request.headers.get("host") && (url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)));
        } catch {}
        if (!validOrigin) throw new AppError(403, "ORIGIN_REJECTED", "This request could not be verified. Please refresh and try again.");
      }
      return await handler(request);
    } catch (error) {
      const requestId = randomUUID();
      if (error instanceof z.ZodError) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Please check the information you entered.", fields: error.issues.map(i => ({ field: i.path.join("."), message: i.message })), requestId } }, { status: 400 });
      if (error instanceof AppError) return NextResponse.json({ error: { code: error.code, message: error.message, requestId } }, { status: error.status });
      console.error("Request failed", { requestId, type: error instanceof Error ? error.name : "UnknownError" });
      return NextResponse.json({ error: { code: "SERVICE_UNAVAILABLE", message: "We could not connect right now. Please try again in a moment.", requestId } }, { status: 503 });
    }
  };
}
export async function body<T>(request: NextRequest, schema: z.ZodType<T>): Promise<T> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new AppError(415, "JSON_REQUIRED", "Please send JSON data.");
  const text = await request.text();
  if (Buffer.byteLength(text) > 16384) throw new AppError(413, "BODY_TOO_LARGE", "That request is too large.");
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new AppError(400, "INVALID_JSON", "That request contains invalid JSON."); }
  return schema.parse(value);
}
export async function currentUser(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  const id = token ? await sessionUser(token) : undefined;
  if (!id) throw new AppError(401, "SESSION_REQUIRED", "Please refresh the page to start a new session.");
  return { id, token: token! };
}
export async function bootstrapSession(request: NextRequest) {
  const existing = request.cookies.get(COOKIE)?.value;
  const id = existing ? await sessionUser(existing) : undefined;
  if (id) return ok({ ready: true });
  const session = await newSession();
  const response = ok({ ready: true }, 201);
  response.cookies.set(COOKIE, session.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}
