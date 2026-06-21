import "server-only";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { createElement } from "react";
import { formatReportDate } from "@/lib/utils";
import type { MonthlyReportDTO, WeeklyReportDTO } from "@/types";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: "#0f172a" },
  h1: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  sub: { fontSize: 10, color: "#64748b", marginBottom: 14 },
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 6 },
  row: { flexDirection: "row", borderBottom: "1px solid #e2e8f0" },
  headRow: { flexDirection: "row", backgroundColor: "#1e293b" },
  th: { color: "#fff", fontFamily: "Helvetica-Bold", padding: 4, fontSize: 8 },
  td: { padding: 4, fontSize: 8 },
  cDate: { width: "12%" },
  cDay: { width: "10%" },
  cProj: { width: "16%" },
  cTask: { width: "26%" },
  cChal: { width: "18%" },
  cLearn: { width: "18%" },
  label: { fontFamily: "Helvetica-Bold", marginTop: 4 },
  para: { marginTop: 2, lineHeight: 1.4 },
});

function SummaryBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return createElement(
    View,
    { style: { marginBottom: 4 } },
    createElement(Text, { style: styles.label }, title),
    createElement(Text, { style: styles.para }, items.join(" • ")),
  );
}

export function buildWeeklyPDF(wr: WeeklyReportDTO): Promise<Buffer> {
  const doc = createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", style: styles.page, orientation: "landscape" },
      createElement(Text, { style: styles.h1 }, `Weekly Report — Week ${wr.isoWeek}, ${wr.isoYear}`),
      createElement(
        Text,
        { style: styles.sub },
        `${formatReportDate(wr.weekStart)} – ${formatReportDate(wr.weekEnd)}`,
      ),
      createElement(
        View,
        { style: styles.headRow },
        createElement(Text, { style: [styles.th, styles.cDate] }, "Date"),
        createElement(Text, { style: [styles.th, styles.cDay] }, "Day"),
        createElement(Text, { style: [styles.th, styles.cProj] }, "Project"),
        createElement(Text, { style: [styles.th, styles.cTask] }, "Tasks Completed"),
        createElement(Text, { style: [styles.th, styles.cChal] }, "Challenges"),
        createElement(Text, { style: [styles.th, styles.cLearn] }, "Learnings"),
      ),
      ...wr.rows.map((r, i) =>
        createElement(
          View,
          { style: styles.row, key: i },
          createElement(Text, { style: [styles.td, styles.cDate] }, formatReportDate(r.date)),
          createElement(Text, { style: [styles.td, styles.cDay] }, r.day),
          createElement(Text, { style: [styles.td, styles.cProj] }, r.project),
          createElement(Text, { style: [styles.td, styles.cTask] }, r.tasksCompleted.join("; ")),
          createElement(Text, { style: [styles.td, styles.cChal] }, r.challenges.join("; ")),
          createElement(Text, { style: [styles.td, styles.cLearn] }, r.learnings.join("; ")),
        ),
      ),
      createElement(Text, { style: styles.h2 }, "Weekly Summary"),
      createElement(SummaryBlock, { title: "Projects Worked On", items: wr.summary.projectsWorkedOn }),
      createElement(SummaryBlock, { title: "Features Completed", items: wr.summary.featuresCompleted }),
      createElement(SummaryBlock, { title: "Bugs Fixed", items: wr.summary.bugsFixed }),
      createElement(SummaryBlock, { title: "Documentation Updates", items: wr.summary.documentationUpdates }),
      createElement(SummaryBlock, { title: "Major Achievements", items: wr.summary.majorAchievements }),
      createElement(SummaryBlock, { title: "Challenges Faced", items: wr.summary.challengesFaced }),
      createElement(SummaryBlock, { title: "Learnings", items: wr.summary.learnings }),
      createElement(SummaryBlock, { title: "Technologies Used", items: wr.summary.technologiesUsed }),
      wr.summary.narrative
        ? createElement(
            View,
            { style: { marginTop: 6 } },
            createElement(Text, { style: styles.label }, "Summary"),
            createElement(Text, { style: styles.para }, wr.summary.narrative),
          )
        : null,
    ),
  );
  return renderToBuffer(doc);
}

export function buildMonthlyPDF(mr: MonthlyReportDTO): Promise<Buffer> {
  const label = new Date(mr.year, mr.month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const doc = createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", style: styles.page },
      createElement(Text, { style: styles.h1 }, `Monthly Report — ${label}`),
      createElement(Text, { style: styles.sub }, `${mr.totalWorkingDays} working days logged`),
      createElement(SummaryBlock, { title: "Projects Worked On", items: mr.summary.projectsWorkedOn }),
      createElement(SummaryBlock, { title: "Features Delivered", items: mr.summary.featuresCompleted }),
      createElement(SummaryBlock, { title: "Bugs Fixed", items: mr.summary.bugsFixed }),
      createElement(SummaryBlock, { title: "Documentation Contributions", items: mr.summary.documentationUpdates }),
      createElement(SummaryBlock, { title: "Top Technologies Used", items: mr.summary.technologiesUsed }),
      createElement(SummaryBlock, { title: "Key Learnings", items: mr.summary.learnings }),
      createElement(SummaryBlock, { title: "Major Achievements", items: mr.summary.majorAchievements }),
      createElement(Text, { style: styles.h2 }, "AI Performance Analysis"),
      createElement(Text, { style: styles.para }, mr.aiPerformanceAnalysis || "—"),
      mr.summary.narrative
        ? createElement(
            View,
            { style: { marginTop: 6 } },
            createElement(Text, { style: styles.label }, "Summary"),
            createElement(Text, { style: styles.para }, mr.summary.narrative),
          )
        : null,
    ),
  );
  return renderToBuffer(doc);
}
