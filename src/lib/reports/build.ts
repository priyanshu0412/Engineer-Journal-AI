import "server-only";
import { connectDB } from "@/lib/mongodb/connect";
import { JournalEntry } from "@/models/JournalEntry";
import { WeeklyReport } from "@/models/WeeklyReport";
import { MonthlyReport } from "@/models/MonthlyReport";
import { generateMonthlyAnalysis, generateWeeklySummary } from "@/lib/ai";
import { getISOWeek, getMonthRange, getWeekRange, weekdayName } from "@/lib/utils";
import { serializeMonthly, serializeWeekly } from "@/lib/serialize";
import { emptySummary } from "@/lib/reports/empty";
import type { AIProcessedEntry, MonthlyReportDTO, WeeklyReportDTO } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function entryAI(doc: any): AIProcessedEntry {
  return {
    detectedLanguages: doc.ai?.detectedLanguages ?? [],
    professionalSummary: doc.ai?.professionalSummary ?? "",
    tasks: doc.ai?.tasks ?? [],
    keyAchievements: doc.ai?.keyAchievements ?? [],
    learnings: doc.ai?.learnings ?? [],
    challenges: doc.ai?.challenges ?? [],
    technologies: doc.ai?.technologies ?? [],
  };
}

/**
 * Build (or rebuild) the weekly report for the week containing `refDate`.
 * Combines that week's daily entries into spreadsheet-style rows plus an
 * AI-generated professional summary, and upserts the WeeklyReport document.
 */
export async function buildWeeklyReport(
  userId: string,
  refDate: Date,
): Promise<WeeklyReportDTO> {
  await connectDB();
  const { start, end } = getWeekRange(refDate);
  const { week, year } = getISOWeek(start);

  const entries = await JournalEntry.find({
    userId,
    date: { $gte: start, $lte: end },
  })
    .sort({ date: 1 })
    .lean();

  const rows = entries.map((e: any) => {
    const ai = entryAI(e);
    return {
      date: e.date,
      day: weekdayName(e.date),
      project: e.projectName,
      tasksCompleted: ai.tasks,
      challenges: ai.challenges,
      learnings: ai.learnings,
      technologies: ai.technologies,
    };
  });

  const summary =
    entries.length > 0
      ? await generateWeeklySummary(
          entries.map((e: any) => ({
            date: new Date(e.date).toISOString().slice(0, 10),
            project: e.projectName,
            ai: entryAI(e),
          })),
        )
      : emptySummary();

  const doc = await WeeklyReport.findOneAndUpdate(
    { userId, isoYear: year, isoWeek: week },
    {
      $set: { weekStart: start, weekEnd: end, rows, summary },
      $setOnInsert: { userId, isoYear: year, isoWeek: week },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return serializeWeekly(doc);
}

/** Build (or rebuild) the monthly report for the month containing `refDate`. */
export async function buildMonthlyReport(
  userId: string,
  refDate: Date,
): Promise<MonthlyReportDTO> {
  await connectDB();
  const { start, end } = getMonthRange(refDate);
  const month = refDate.getMonth();
  const year = refDate.getFullYear();

  const entries = await JournalEntry.find({
    userId,
    date: { $gte: start, $lte: end },
  })
    .sort({ date: 1 })
    .lean();

  // Distinct calendar days logged.
  const days = new Set(entries.map((e: any) => new Date(e.date).toDateString()));

  const analysis =
    entries.length > 0
      ? await generateMonthlyAnalysis(
          entries.map((e: any) => ({
            date: new Date(e.date).toISOString().slice(0, 10),
            project: e.projectName,
            ai: entryAI(e),
          })),
        )
      : { ...emptySummary(), aiPerformanceAnalysis: "" };

  const { aiPerformanceAnalysis, ...summary } = analysis;

  const doc = await MonthlyReport.findOneAndUpdate(
    { userId, year, month },
    {
      $set: {
        totalWorkingDays: days.size,
        summary,
        aiPerformanceAnalysis,
      },
      $setOnInsert: { userId, year, month },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return serializeMonthly(doc);
}
