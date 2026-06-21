import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron/auth";
import { runDailyReminderForAllUsers } from "@/lib/cron/run";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Scheduled daily at 7 PM IST (1:30 PM UTC) (see vercel.json).
// Sends reminder emails to users who haven't logged today's work yet.
export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runDailyReminderForAllUsers();
  return NextResponse.json({ ok: true, ...result });
}
