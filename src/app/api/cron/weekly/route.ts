import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron/auth";
import { runWeeklyForAllUsers } from "@/lib/cron/run";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Scheduled every Friday 6 PM (see vercel.json). Generates & emails weekly reports.
export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runWeeklyForAllUsers();
  return NextResponse.json({ ok: true, ...result });
}
