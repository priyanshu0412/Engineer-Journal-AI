import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportMenu } from "@/components/reports/export-menu";
import { SummaryList } from "@/components/reports/summary-list";
import { formatMonthLabel } from "@/lib/utils";
import type { MonthlyReportDTO } from "@/types";

export function MonthlyView({ report }: { report: MonthlyReportDTO }) {
  const label = formatMonthLabel(report.year, report.month);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{label}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {report.totalWorkingDays} working days logged
          </p>
        </div>
        <ExportMenu base={`/api/export/monthly/${report.id}`} formats={["pdf", "xlsx", "markdown"]} />
      </CardHeader>
      <CardContent className="space-y-5">
        {report.aiPerformanceAnalysis && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <h3 className="mb-2 font-semibold">AI Performance Analysis</h3>
            <p className="text-sm leading-relaxed">{report.aiPerformanceAnalysis}</p>
          </div>
        )}
        {report.summary.narrative && (
          <p className="text-sm leading-relaxed">{report.summary.narrative}</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryList title="Projects Worked On" items={report.summary.projectsWorkedOn} />
          <SummaryList title="Features Delivered" items={report.summary.featuresCompleted} />
          <SummaryList title="Bugs Fixed" items={report.summary.bugsFixed} />
          <SummaryList title="Documentation" items={report.summary.documentationUpdates} />
          <SummaryList title="Top Technologies" items={report.summary.technologiesUsed} />
          <SummaryList title="Key Learnings" items={report.summary.learnings} />
          <SummaryList title="Major Achievements" items={report.summary.majorAchievements} />
        </div>
      </CardContent>
    </Card>
  );
}
