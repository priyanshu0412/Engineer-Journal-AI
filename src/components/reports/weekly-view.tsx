import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExportMenu } from "@/components/reports/export-menu";
import { SummaryList } from "@/components/reports/summary-list";
import { formatReportDate } from "@/lib/utils";
import type { WeeklyReportDTO } from "@/types";

export function WeeklyView({ report }: { report: WeeklyReportDTO }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">
            Week {report.isoWeek}, {report.isoYear}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatReportDate(report.weekStart)} – {formatReportDate(report.weekEnd)}
          </p>
        </div>
        <ExportMenu base={`/api/export/weekly/${report.id}`} />
      </CardHeader>
      <CardContent className="space-y-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Tasks Completed</TableHead>
              <TableHead>Challenges</TableHead>
              <TableHead>Learnings</TableHead>
              <TableHead>Technologies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No entries logged this week.
                </TableCell>
              </TableRow>
            ) : (
              report.rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="whitespace-nowrap">{formatReportDate(r.date)}</TableCell>
                  <TableCell>{r.day}</TableCell>
                  <TableCell>{r.project}</TableCell>
                  <TableCell>{r.tasksCompleted.join("; ")}</TableCell>
                  <TableCell>{r.challenges.join("; ")}</TableCell>
                  <TableCell>{r.learnings.join("; ")}</TableCell>
                  <TableCell className="space-x-1">
                    {r.technologies.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="rounded-lg border bg-muted/30 p-4">
          <h3 className="mb-3 font-semibold">Weekly Summary</h3>
          {report.summary.narrative && (
            <p className="mb-4 text-sm leading-relaxed">{report.summary.narrative}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
