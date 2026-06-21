import { formatReportDate, weekdayName } from "@/lib/utils";
import type { JournalEntryDTO, WeeklyReportDTO } from "@/types";

/** Escape a single CSV field per RFC 4180. */
function csvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function csvRow(fields: string[]): string {
  return fields.map(csvField).join(",");
}

/** Daily logs as CSV. */
export function entriesToCSV(entries: JournalEntryDTO[]): string {
  const lines = [
    csvRow(["Date", "Day", "Project", "Tasks Completed", "Challenges", "Learnings", "Technologies"]),
  ];
  for (const e of entries) {
    lines.push(
      csvRow([
        formatReportDate(e.date),
        weekdayName(e.date),
        e.projectName,
        e.ai.tasks.join(" | "),
        e.ai.challenges.join(" | "),
        e.ai.learnings.join(" | "),
        e.ai.technologies.join(" | "),
      ]),
    );
  }
  return lines.join("\n");
}

/** A weekly report rendered as Markdown (manager-update / appraisal friendly). */
export function weeklyToMarkdown(wr: WeeklyReportDTO): string {
  const out: string[] = [];
  out.push(`# Weekly Report — Week ${wr.isoWeek}, ${wr.isoYear}`);
  out.push(`_${formatReportDate(wr.weekStart)} – ${formatReportDate(wr.weekEnd)}_`, "");

  out.push("| Date | Day | Project | Tasks Completed | Challenges | Learnings | Technologies |");
  out.push("|------|-----|---------|-----------------|------------|-----------|--------------|");
  for (const r of wr.rows) {
    out.push(
      `| ${formatReportDate(r.date)} | ${r.day} | ${r.project} | ${r.tasksCompleted.join("; ")} | ${r.challenges.join("; ")} | ${r.learnings.join("; ")} | ${r.technologies.join(", ")} |`,
    );
  }
  out.push("", "## Weekly Summary", "");

  const section = (title: string, items: string[]) => {
    if (!items.length) return;
    out.push(`### ${title}`);
    items.forEach((i) => out.push(`- ${i}`));
    out.push("");
  };
  section("Projects Worked On", wr.summary.projectsWorkedOn);
  section("Features Completed", wr.summary.featuresCompleted);
  section("Bugs Fixed", wr.summary.bugsFixed);
  section("Documentation Updates", wr.summary.documentationUpdates);
  section("Major Achievements", wr.summary.majorAchievements);
  section("Challenges Faced", wr.summary.challengesFaced);
  section("Learnings", wr.summary.learnings);
  section("Technologies Used", wr.summary.technologiesUsed);

  if (wr.summary.narrative) {
    out.push("### Summary", "", wr.summary.narrative, "");
  }
  return out.join("\n");
}
