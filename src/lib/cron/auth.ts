import type { NextRequest } from "next/server";

/**
 * Verify a cron request. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
 * We also accept an `x-cron-secret` header for manual triggering.
 */
export function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  if (req.headers.get("x-cron-secret") === secret) return true;
  return false;
}
