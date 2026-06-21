import { NextResponse, type NextRequest } from "next/server";
import { requireUserId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb/connect";
import { JournalEntry } from "@/models/JournalEntry";
import { WeeklyReport } from "@/models/WeeklyReport";
import { MonthlyReport } from "@/models/MonthlyReport";
import { serializeEntry, serializeMonthly, serializeWeekly } from "@/lib/serialize";
import { buildWorkbook } from "@/lib/excel/workbook";
import { entriesToCSV } from "@/lib/export/text";
import { fileResponse } from "@/lib/export/response";
import type { ExportFormat } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const year = Number(req.nextUrl.searchParams.get("year")) || new Date().getFullYear();
    const format = (req.nextUrl.searchParams.get("format") ?? "xlsx") as ExportFormat;

    const start = new Date(year, 0, 1, 0, 0, 0, 0);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    await connectDB();
    const [entryDocs, weeklyDocs, monthlyDocs] = await Promise.all([
      JournalEntry.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }).lean(),
      WeeklyReport.find({ userId, isoYear: year }).sort({ weekStart: 1 }).lean(),
      MonthlyReport.find({ userId, year }).sort({ month: 1 }).lean(),
    ]);

    const entries = entryDocs.map(serializeEntry);

    if (format === "csv") {
      return fileResponse(entriesToCSV(entries), `devtrack-${year}.csv`, "text/csv");
    }

    const buf = await buildWorkbook({
      year,
      entries,
      weeklies: weeklyDocs.map(serializeWeekly),
      monthlies: monthlyDocs.map(serializeMonthly),
    });
    return fileResponse(
      buf,
      `devtrack-${year}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export failed" },
      { status: 500 },
    );
  }
}
