"use server";

import { requireUserId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb/connect";
import { WeeklyReport } from "@/models/WeeklyReport";
import { MonthlyReport } from "@/models/MonthlyReport";
import { buildMonthlyReport, buildWeeklyReport } from "@/lib/reports/build";
import { serializeMonthly, serializeWeekly } from "@/lib/serialize";
import type { MonthlyReportDTO, WeeklyReportDTO } from "@/types";

/** Generate (or regenerate) the weekly report for the week containing `dateISO`. */
export async function generateWeekly(dateISO?: string): Promise<WeeklyReportDTO> {
  const userId = await requireUserId();
  const ref = dateISO ? new Date(dateISO) : new Date();
  return buildWeeklyReport(userId, ref);
}

/** Generate (or regenerate) the monthly report for the month containing `dateISO`. */
export async function generateMonthly(dateISO?: string): Promise<MonthlyReportDTO> {
  const userId = await requireUserId();
  const ref = dateISO ? new Date(dateISO) : new Date();
  return buildMonthlyReport(userId, ref);
}

export async function listWeeklyReports(): Promise<WeeklyReportDTO[]> {
  const userId = await requireUserId();
  await connectDB();
  const docs = await WeeklyReport.find({ userId }).sort({ weekStart: -1 }).limit(52).lean();
  return docs.map(serializeWeekly);
}

export async function listMonthlyReports(): Promise<MonthlyReportDTO[]> {
  const userId = await requireUserId();
  await connectDB();
  const docs = await MonthlyReport.find({ userId }).sort({ year: -1, month: -1 }).limit(24).lean();
  return docs.map(serializeMonthly);
}
