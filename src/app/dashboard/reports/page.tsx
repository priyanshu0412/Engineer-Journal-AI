import { listMonthlyReports, listWeeklyReports } from "@/actions/reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { WeeklyView } from "@/components/reports/weekly-view";
import { MonthlyView } from "@/components/reports/monthly-view";
import { GenerateMonthlyButton, GenerateWeeklyButton } from "@/components/reports/generate-buttons";
import { ExportMenu } from "@/components/reports/export-menu";
import type { MonthlyReportDTO, WeeklyReportDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  let weekly: WeeklyReportDTO[] = [];
  let monthly: MonthlyReportDTO[] = [];
  let error: string | null = null;
  try {
    [weekly, monthly] = await Promise.all([listWeeklyReports(), listMonthlyReports()]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load reports.";
  }

  const year = new Date().getFullYear();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Weekly and monthly reports built automatically from your entries.
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <div className="flex justify-end">
              <GenerateWeeklyButton />
            </div>
            {weekly.length === 0 ? (
              <EmptyReport text="No weekly reports yet. Generate one for the current week." />
            ) : (
              weekly.map((r) => <WeeklyView key={r.id} report={r} />)
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="flex justify-end">
              <GenerateMonthlyButton />
            </div>
            {monthly.length === 0 ? (
              <EmptyReport text="No monthly reports yet. Generate one for the current month." />
            ) : (
              monthly.map((r) => <MonthlyView key={r.id} report={r} />)
            )}
          </TabsContent>

          <TabsContent value="yearly" className="space-y-4">
            <Card>
              <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Yearly summary — {year}</p>
                  <p className="text-sm text-muted-foreground">
                    Export a full workbook with daily logs, weekly &amp; monthly reports, and a
                    yearly summary sheet.
                  </p>
                </div>
                <ExportMenu
                  base={`/api/export/yearly?year=${year}`}
                  formats={["xlsx", "csv"]}
                  size="default"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function EmptyReport({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="p-10 text-center text-sm text-muted-foreground">{text}</CardContent>
    </Card>
  );
}
