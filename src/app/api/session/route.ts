import { bootstrapSession, endpoint } from "@/server/http";
export const runtime = "nodejs";
export const POST = endpoint(bootstrapSession);
