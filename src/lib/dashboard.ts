import "server-only";
import { connectDB } from "@/lib/mongodb/connect";
import { JournalEntry } from "@/models/JournalEntry";
import { WeeklyReport } from "@/models/WeeklyReport";
import { MonthlyReport } from "@/models/MonthlyReport";
import { serializeEntry, serializeMonthly, serializeWeekly } from "@/lib/serialize";
import { getMonthRange } from "@/lib/utils";
import type { DashboardStats } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Count consecutive days ending today (or yesterday) that have an entry. */
function computeStreak(dates: Date[]): number {
  const days = new Set(dates.map((d) => new Date(d).toDateString()));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // Allow the streak to "still be alive" if today isn't logged yet but yesterday was.
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toDateString())) return 0;
  }
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  await connectDB();

  // Streak only needs the last 366 days — no need to load every entry ever logged.
  const streakCutoff = new Date();
  streakCutoff.setDate(streakCutoff.getDate() - 366);

  const { start, end } = getMonthRange(new Date());

  const [recentDates, totalEntries, recent, lastWeekly, lastMonthly, currentMonthActivity] =
    await Promise.all([
      JournalEntry.find({ userId, date: { $gte: streakCutoff } }).select("date").lean(),
      JournalEntry.countDocuments({ userId }),
      JournalEntry.find({ userId }).sort({ date: -1 }).limit(5).lean(),
      WeeklyReport.findOne({ userId }).sort({ weekStart: -1 }).lean(),
      MonthlyReport.findOne({ userId }).sort({ year: -1, month: -1 }).lean(),
      JournalEntry.countDocuments({ userId, date: { $gte: start, $lte: end } }),
    ]);

  return {
    currentStreak: computeStreak((recentDates as any[]).map((d) => d.date)),
    totalEntries,
    currentMonthActivity,
    recentEntries: (recent as any[]).map(serializeEntry),
    lastWeeklyReport: lastWeekly ? serializeWeekly(lastWeekly) : null,
    lastMonthlyReport: lastMonthly ? serializeMonthly(lastMonthly) : null,
  };
}
