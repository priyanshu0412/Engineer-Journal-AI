import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExportMenu } from "@/components/reports/export-menu";
import { SummaryList } from "@/components/reports/summary-list";
import { formatReportDate } from "@/lib/utils";
import type { WeeklyReportDTO } from "@/types";
import { Calendar, Sparkles } from "lucide-react";

export function WeeklyView({ report }: { report: WeeklyReportDTO }) {
  return (
    <Card className="transition-all duration-300 hover:border-primary/15 hover:shadow-md bg-card/65 backdrop-blur-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 pb-3 border-b border-muted-foreground/5 bg-muted/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">
              Week {report.isoWeek}, {report.isoYear}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {formatReportDate(report.weekStart)} – {formatReportDate(report.weekEnd)}
            </p>
          </div>
        </div>
        <ExportMenu base={`/api/export/weekly/${report.id}`} />
      </CardHeader>
      
      <CardContent className="p-5 space-y-6">
        <div className="rounded-xl border border-muted-foreground/10 overflow-hidden bg-background/50">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs py-3">Date</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Day</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Project</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Tasks Completed</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Challenges</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Learnings</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Technologies</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                      No entries logged this week.
                    </TableCell>
                  </TableRow>
                ) : (
                  report.rows.map((r, i) => (
                    <TableRow key={i} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="whitespace-nowrap font-medium text-xs py-3.5">{formatReportDate(r.date)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium py-3.5">{r.day}</TableCell>
                      <TableCell className="font-bold text-xs py-3.5">{r.project}</TableCell>
                      <TableCell className="text-xs text-foreground/80 max-w-[200px] leading-relaxed py-3.5">
                        {r.tasksCompleted.length > 0 ? (
                          <ul className="list-inside list-disc space-y-0.5">
                            {r.tasksCompleted.map((t, idx) => <li key={idx}>{t}</li>)}
                          </ul>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] leading-relaxed py-3.5">
                        {r.challenges.length > 0 ? (
                          <ul className="list-inside list-disc space-y-0.5">
                            {r.challenges.map((c, idx) => <li key={idx}>{c}</li>)}
                          </ul>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] leading-relaxed py-3.5">
                        {r.learnings.length > 0 ? (
                          <ul className="list-inside list-disc space-y-0.5">
                            {r.learnings.map((l, idx) => <li key={idx}>{l}</li>)}
                          </ul>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {r.technologies.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[9px] px-1 py-0 font-mono">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="rounded-xl border border-primary/10 bg-primary/[0.01] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <h3 className="font-bold text-sm tracking-wide text-foreground">Weekly Performance Summary</h3>
          </div>
          
          {report.summary.narrative && (
            <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 font-medium bg-background/50 border border-muted-foreground/5 rounded-xl p-4 italic">
              "{report.summary.narrative}"
            </p>
          )}
          
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryList title="Projects Worked On" items={report.summary.projectsWorkedOn} />
            <SummaryList title="Features Completed" items={report.summary.featuresCompleted} />
            <SummaryList title="Bugs Fixed" items={report.summary.bugsFixed} />
            <SummaryList title="Documentation Updates" items={report.summary.documentationUpdates} />
            <SummaryList title="Major Achievements" items={report.summary.majorAchievements} />
            <SummaryList title="Challenges Faced" items={report.summary.challengesFaced} />
            <SummaryList title="Learnings" items={report.summary.learnings} />
            <SummaryList title="Technologies Used" items={report.summary.technologiesUsed} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

