import { NextResponse, type NextRequest } from "next/server";
import { requireUserId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb/connect";
import { MonthlyReport } from "@/models/MonthlyReport";
import { JournalEntry } from "@/models/JournalEntry";
import { serializeEntry, serializeMonthly } from "@/lib/serialize";
import { buildMonthlyPDF } from "@/lib/pdf/WeeklyReportPDF";
import { buildWorkbook } from "@/lib/excel/workbook";
import { fileResponse } from "@/lib/export/response";
import { formatMonthLabel, getMonthRange } from "@/lib/utils";
import type { ExportFormat } from "@/types";

export const dynamic = "force-dynamic";

function monthlyMarkdown(report: ReturnType<typeof serializeMonthly>): string {
  const label = formatMonthLabel(report.year, report.month);
  const sec = (t: string, items: string[]) =>
    items.length ? `### ${t}\n${items.map((i) => `- ${i}`).join("\n")}\n` : "";
  return [
    `# Monthly Report — ${label}`,
    `_${report.totalWorkingDays} working days logged_\n`,
    report.aiPerformanceAnalysis ? `## AI Performance Analysis\n${report.aiPerformanceAnalysis}\n` : "",
    "## Summary\n",
    sec("Projects Worked On", report.summary.projectsWorkedOn),
    sec("Features Delivered", report.summary.featuresCompleted),
    sec("Bugs Fixed", report.summary.bugsFixed),
    sec("Documentation Contributions", report.summary.documentationUpdates),
    sec("Top Technologies Used", report.summary.technologiesUsed),
    sec("Key Learnings", report.summary.learnings),
    sec("Major Achievements", report.summary.majorAchievements),
    report.summary.narrative ? `### Narrative\n${report.summary.narrative}` : "",
  ].join("\n");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const format = (req.nextUrl.searchParams.get("format") ?? "pdf") as ExportFormat;

    await connectDB();
    const doc = await MonthlyReport.findOne({ _id: id, userId }).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const report = serializeMonthly(doc);
    const stem = `monthly-report-${report.year}-${String(report.month + 1).padStart(2, "0")}`;

    switch (format) {
      case "pdf":
        return fileResponse(await buildMonthlyPDF(report), `${stem}.pdf`, "application/pdf");
      case "markdown":
        return fileResponse(monthlyMarkdown(report), `${stem}.md`, "text/markdown");
      case "xlsx": {
        const { start, end } = getMonthRange(new Date(report.year, report.month, 15));
        const entries = await JournalEntry.find({ userId, date: { $gte: start, $lte: end } })
          .sort({ date: 1 })
          .lean();
        const buf = await buildWorkbook({
          year: report.year,
          entries: entries.map(serializeEntry),
          weeklies: [],
          monthlies: [report],
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
