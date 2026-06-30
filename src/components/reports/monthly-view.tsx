import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportMenu } from "@/components/reports/export-menu";
import { SummaryList } from "@/components/reports/summary-list";
import { formatMonthLabel } from "@/lib/utils";
import type { MonthlyReportDTO } from "@/types";
import { Calendar, Sparkles, TrendingUp } from "lucide-react";

export function MonthlyView({ report }: { report: MonthlyReportDTO }) {
  const label = formatMonthLabel(report.year, report.month);
  return (
    <Card className="transition-all duration-300 hover:border-primary/15 hover:shadow-md bg-card/65 backdrop-blur-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 pb-3 border-b border-muted-foreground/5 bg-muted/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">{label}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {report.totalWorkingDays} working days logged
            </p>
          </div>
        </div>
        <ExportMenu base={`/api/export/monthly/${report.id}`} formats={["pdf", "xlsx", "markdown"]} />
      </CardHeader>
      
      <CardContent className="p-5 space-y-5">
        {report.aiPerformanceAnalysis && (
          <div className="rounded-xl border border-primary/10 bg-primary/[0.01] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary animate-pulse" />
              <h3 className="font-bold text-sm tracking-wide text-foreground">AI Monthly Performance Analysis</h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 font-medium bg-background/50 border border-muted-foreground/5 rounded-xl p-4 italic">
              "{report.aiPerformanceAnalysis}"
            </p>
          </div>
        )}
        
        {report.summary.narrative && (
          <div className="rounded-xl border border-muted-foreground/10 bg-muted/5 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm tracking-wide text-foreground">Monthly Summary Overview</h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-medium pl-0.5">
              {report.summary.narrative}
            </p>
          </div>
        )}
        
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
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

