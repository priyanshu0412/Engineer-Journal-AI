import "server-only";
import { connectDB } from "@/lib/mongodb/connect";
import { JournalEntry } from "@/models/JournalEntry";
import type { AnalyticsData } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function tally(map: Map<string, number>, items: string[]) {
  for (const raw of items) {
    const v = raw.trim();
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
}

function topN(map: Map<string, number>, n = 12) {
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/** Compute the analytics dashboard data from all of a user's entries. */
export async function computeAnalytics(userId: string): Promise<AnalyticsData> {
  await connectDB();
  const entries = await JournalEntry.find({ userId }).sort({ date: 1 }).lean();

  const projects = new Map<string, number>();
  const technologies = new Map<string, number>();
  const monthCounts = new Map<string, number>(); // "Jun 2026" -> entries
  const learningByMonth = new Map<string, number>();
  const challengeByMonth = new Map<string, number>();

  for (const e of entries as any[]) {
    const d = new Date(e.date);
    const monthLabel = d.toLocaleString("en-US", { month: "short", year: "numeric" });

    projects.set(e.projectName, (projects.get(e.projectName) ?? 0) + 1);
    tally(technologies, e.ai?.technologies ?? []);
    monthCounts.set(monthLabel, (monthCounts.get(monthLabel) ?? 0) + 1);

    learningByMonth.set(
      monthLabel,
      (learningByMonth.get(monthLabel) ?? 0) + (e.ai?.learnings?.length ?? 0),
    );
    challengeByMonth.set(
      monthLabel,
      (challengeByMonth.get(monthLabel) ?? 0) + (e.ai?.challenges?.length ?? 0),
    );
  }

  let mostActiveMonth: AnalyticsData["mostActiveMonth"] = null;
  for (const [label, count] of monthCounts) {
    if (!mostActiveMonth || count > mostActiveMonth.count) {
      mostActiveMonth = { label, count };
    }
  }

  // Preserve chronological order for trend lines.
  const orderedMonths = [...monthCounts.keys()];

  return {
    projects: topN(projects),
    technologies: topN(technologies),
    mostActiveMonth,
    learningTrend: orderedMonths.map((m) => ({ period: m, count: learningByMonth.get(m) ?? 0 })),
    challengeTrend: orderedMonths.map((m) => ({ period: m, count: challengeByMonth.get(m) ?? 0 })),
    totalEntries: entries.length,
  };
}
