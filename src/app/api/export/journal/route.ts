import { NextResponse, type NextRequest } from "next/server";
import { requireUserId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb/connect";
import { JournalEntry } from "@/models/JournalEntry";
import { serializeEntry } from "@/lib/serialize";
import { buildJournalPDF } from "@/lib/pdf/WeeklyReportPDF";
import { buildWorkbook } from "@/lib/excel/workbook";
import { entriesToCSV } from "@/lib/export/text";
import { fileResponse } from "@/lib/export/response";
import type { ExportFormat } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    
    // Read query parameters matching listEntries filters
    const search = req.nextUrl.searchParams.get("search") ?? "";
    const project = req.nextUrl.searchParams.get("project") ?? "";
    const from = req.nextUrl.searchParams.get("from") ?? "";
    const to = req.nextUrl.searchParams.get("to") ?? "";
    const format = (req.nextUrl.searchParams.get("format") ?? "pdf") as ExportFormat;

    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { userId };
    if (project) {
      query.projectName = project;
    }
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    if (search.trim()) {
      const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { rawNotes: rx },
        { projectName: rx },
        { "ai.professionalSummary": rx },
        { "ai.tasks": rx },
        { "ai.technologies": rx },
      ];
    }

    const docs = await JournalEntry.find(query).sort({ date: -1 }).limit(1000).lean();
    const entries = docs.map(serializeEntry);

    // Build stem filename based on dates
    let stem = "journal-export";
    if (from && to) stem = `journal-export-${from}-to-${to}`;
    else if (from) stem = `journal-export-from-${from}`;
    else if (to) stem = `journal-export-to-${to}`;

    // Format human-readable filter details for PDF subtitle
    let description = `Total logs: ${entries.length}.`;
    const filterInfo: string[] = [];
    if (project) filterInfo.push(`Project: ${project}`);
    if (search) filterInfo.push(`Search: "${search}"`);
    if (from || to) {
      if (from && to) filterInfo.push(`Range: ${from} to ${to}`);
      else if (from) filterInfo.push(`From: ${from}`);
      else if (to) filterInfo.push(`To: ${to}`);
    }
    if (filterInfo.length > 0) {
      description += ` Filters: ${filterInfo.join(", ")}`;
    }

    switch (format) {
      case "pdf":
        return fileResponse(await buildJournalPDF(entries, description), `${stem}.pdf`, "application/pdf");
      case "csv":
        return fileResponse(entriesToCSV(entries), `${stem}.csv`, "text/csv");
      case "xlsx": {
        const buf = await buildWorkbook({
          year: new Date().getFullYear(),
          entries,
          weeklies: [],
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
  } catch (err) {
    console.error("Journal export error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 },
    );
  }
}
