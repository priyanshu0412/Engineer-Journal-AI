import "server-only";
import ExcelJS from "exceljs";
import { formatReportDate, weekdayName } from "@/lib/utils";
import type { JournalEntryDTO, MonthlyReportDTO, WeeklyReportDTO } from "@/types";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E293B" },
};
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" } };

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  });
}

const list = (items: string[]) => items.join("\n");

export interface WorkbookData {
  year: number;
  entries: JournalEntryDTO[];
  weeklies: WeeklyReportDTO[];
  monthlies: MonthlyReportDTO[];
}

/**
 * Build a 4-sheet workbook: Daily Logs, Weekly Reports, Monthly Reports,
 * Yearly Summary. Returns the file as a Buffer.
 */
export async function buildWorkbook(data: WorkbookData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "DevTrack AI";
  wb.created = new Date();

  // ── Sheet 1: Daily Logs ───────────────────────────────────────────────
  const daily = wb.addWorksheet("Daily Logs");
  daily.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Day", key: "day", width: 12 },
    { header: "Project", key: "project", width: 22 },
    { header: "Tasks Completed", key: "tasks", width: 40 },
    { header: "Challenges", key: "challenges", width: 30 },
    { header: "Learnings", key: "learnings", width: 30 },
    { header: "Technologies", key: "tech", width: 24 },
  ];
  styleHeader(daily.getRow(1));
  for (const e of data.entries) {
    daily.addRow({
      date: formatReportDate(e.date),
      day: weekdayName(e.date),
      project: e.projectName,
      tasks: list(e.ai.tasks),
      challenges: list(e.ai.challenges),
      learnings: list(e.ai.learnings),
      tech: list(e.ai.technologies),
    }).alignment = { vertical: "top", wrapText: true };
  }

  // ── Sheet 2: Weekly Reports ───────────────────────────────────────────
  const weekly = wb.addWorksheet("Weekly Reports");
  weekly.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Day", key: "day", width: 12 },
    { header: "Project", key: "project", width: 22 },
    { header: "Tasks Completed", key: "tasks", width: 38 },
    { header: "Challenges", key: "challenges", width: 28 },
    { header: "Learnings", key: "learnings", width: 28 },
    { header: "Technologies", key: "tech", width: 22 },
    { header: "", key: "spacer", width: 4 },
    { header: "Weekly Summary", key: "sumKey", width: 24 },
    { header: "", key: "sumVal", width: 50 },
  ];
  styleHeader(weekly.getRow(1));

  for (const wr of data.weeklies) {
    const header = weekly.addRow({
      date: `Week ${wr.isoWeek}, ${wr.isoYear}`,
      day: "",
      project: `${formatReportDate(wr.weekStart)} – ${formatReportDate(wr.weekEnd)}`,
    });
    header.font = { bold: true };

    const summaryLines: [string, string][] = [
      ["Projects", wr.summary.projectsWorkedOn.join(", ")],
      ["Features Completed", wr.summary.featuresCompleted.join("; ")],
      ["Bugs Fixed", wr.summary.bugsFixed.join("; ")],
      ["Documentation", wr.summary.documentationUpdates.join("; ")],
      ["Major Achievements", wr.summary.majorAchievements.join("; ")],
      ["Challenges", wr.summary.challengesFaced.join("; ")],
      ["Learnings", wr.summary.learnings.join("; ")],
      ["Technologies", wr.summary.technologiesUsed.join(", ")],
      ["Narrative", wr.summary.narrative],
    ];

    wr.rows.forEach((r, i) => {
      const [sumKey, sumVal] = summaryLines[i] ?? ["", ""];
      const row = weekly.addRow({
        date: formatReportDate(r.date),
        day: r.day,
        project: r.project,
        tasks: list(r.tasksCompleted),
        challenges: list(r.challenges),
        learnings: list(r.learnings),
        tech: list(r.technologies),
        sumKey,
        sumVal,
      });
      row.alignment = { vertical: "top", wrapText: true };
      row.getCell("sumKey").font = { bold: true };
    });

    // Emit any remaining summary lines that overflow past the daily rows.
    for (let i = wr.rows.length; i < summaryLines.length; i++) {
      const [sumKey, sumVal] = summaryLines[i];
      const row = weekly.addRow({ sumKey, sumVal });
      row.alignment = { vertical: "top", wrapText: true };
      row.getCell("sumKey").font = { bold: true };
    }
    weekly.addRow({});
  }

  // ── Sheet 3: Monthly Reports ──────────────────────────────────────────
  const monthly = wb.addWorksheet("Monthly Reports");
  monthly.columns = [
    { header: "Metric", key: "metric", width: 26 },
    { header: "Value", key: "value", width: 80 },
  ];
  styleHeader(monthly.getRow(1));
  for (const mr of data.monthlies) {
    const label = new Date(mr.year, mr.month, 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    const title = monthly.addRow({ metric: label, value: "" });
    title.font = { bold: true };
    const pairs: [string, string][] = [
      ["Total Working Days Logged", String(mr.totalWorkingDays)],
      ["Projects Worked On", mr.summary.projectsWorkedOn.join(", ")],
      ["Features Delivered", mr.summary.featuresCompleted.join("; ")],
      ["Bugs Fixed", mr.summary.bugsFixed.join("; ")],
      ["Documentation Contributions", mr.summary.documentationUpdates.join("; ")],
      ["Top Technologies Used", mr.summary.technologiesUsed.join(", ")],
      ["Key Learnings", mr.summary.learnings.join("; ")],
      ["Major Achievements", mr.summary.majorAchievements.join("; ")],
      ["AI Performance Analysis", mr.aiPerformanceAnalysis],
    ];
    for (const [metric, value] of pairs) {
      const row = monthly.addRow({ metric, value });
      row.alignment = { vertical: "top", wrapText: true };
      row.getCell("metric").font = { bold: true };
    }
    monthly.addRow({});
  }

  // ── Sheet 4: Yearly Summary ───────────────────────────────────────────
  const yearly = wb.addWorksheet("Yearly Summary");
  yearly.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value", key: "value", width: 80 },
  ];
  styleHeader(yearly.getRow(1));
  const allTech = new Set<string>();
  const allProjects = new Set<string>();
  data.entries.forEach((e) => {
    e.ai.technologies.forEach((t) => allTech.add(t));
    allProjects.add(e.projectName);
  });
  const yearlyPairs: [string, string][] = [
    ["Year", String(data.year)],
    ["Total Entries", String(data.entries.length)],
    ["Projects Worked On", [...allProjects].join(", ")],
    ["Technologies Used", [...allTech].join(", ")],
    ["Weekly Reports Generated", String(data.weeklies.length)],
    ["Monthly Reports Generated", String(data.monthlies.length)],
  ];
  for (const [metric, value] of yearlyPairs) {
    const row = yearly.addRow({ metric, value });
    row.alignment = { vertical: "top", wrapText: true };
    row.getCell("metric").font = { bold: true };
  }

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
