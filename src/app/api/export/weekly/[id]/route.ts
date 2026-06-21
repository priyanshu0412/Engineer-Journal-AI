import { NextResponse, type NextRequest } from "next/server";
import { requireUserId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb/connect";
import { WeeklyReport } from "@/models/WeeklyReport";
import { JournalEntry } from "@/models/JournalEntry";
import { serializeEntry, serializeWeekly } from "@/lib/serialize";
import { buildWeeklyPDF } from "@/lib/pdf/WeeklyReportPDF";
import { buildWorkbook } from "@/lib/excel/workbook";
import { entriesToCSV, weeklyToMarkdown } from "@/lib/export/text";
import { fileResponse } from "@/lib/export/response";
import type { ExportFormat } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const format = (req.nextUrl.searchParams.get("format") ?? "pdf") as ExportFormat;

    await connectDB();
    const doc = await WeeklyReport.findOne({ _id: id, userId }).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const report = serializeWeekly(doc);
    const stem = `weekly-report-w${report.isoWeek}-${report.isoYear}`;

    switch (format) {
      case "pdf":
        return fileResponse(await buildWeeklyPDF(report), `${stem}.pdf`, "application/pdf");
      case "markdown":
        return fileResponse(weeklyToMarkdown(report), `${stem}.md`, "text/markdown");
      case "csv": {
        const entries = await JournalEntry.find({
          userId,
          date: { $gte: doc.weekStart, $lte: doc.weekEnd },
        })
          .sort({ date: 1 })
          .lean();
        return fileResponse(entriesToCSV(entries.map(serializeEntry)), `${stem}.csv`, "text/csv");
      }
      case "xlsx": {
        const entries = await JournalEntry.find({
          userId,
          date: { $gte: doc.weekStart, $lte: doc.weekEnd },
        })
          .sort({ date: 1 })
          .lean();
        const buf = await buildWorkbook({
          year: report.isoYear,
          entries: entries.map(serializeEntry),
          weeklies: [report],
          monthlies: [],
        });
        return fileResponse(
          buf,
          `${stem}.xlsx`,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
      }
      default:
        return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export failed" },
      { status: 500 },
    );
  }
}
