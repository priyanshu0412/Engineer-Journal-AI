import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron/auth";
import { runMonthlyForAllUsers } from "@/lib/cron/run";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Scheduled daily (see vercel.json). Only runs the monthly report when today is
 * the last day of the month, so it captures the full month before it rolls over.
 * Pass ?force=1 with the cron secret to run regardless (manual trigger).
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Convert UTC now to Indian Standard Time (IST = UTC + 5:30) for last-day calculation
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);

  const tomorrow = new Date(istNow);
  tomorrow.setDate(istNow.getDate() + 1);
  const isLastDay = tomorrow.getMonth() !== istNow.getMonth();
  const force = req.nextUrl.searchParams.get("force") === "1";

  if (!isLastDay && !force) {
    return NextResponse.json({ ok: true, skipped: true, reason: "not month end" });
  }

  const result = await runMonthlyForAllUsers(now);
  return NextResponse.json({ ok: true, ...result });
}
