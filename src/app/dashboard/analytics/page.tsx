import { BarChart3, FolderGit2, CalendarRange, Cpu } from "lucide-react";
import { requireUserId } from "@/lib/auth";
import { computeAnalytics } from "@/lib/analytics/compute";
import { AnalyticsCharts } from "@/components/analytics/charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalyticsData } from "@/types";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  let data: AnalyticsData | null = null;
  let error: string | null = null;
  try {
    const userId = await requireUserId();
    data = await computeAnalytics(userId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load analytics.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Trends across your logged work.</p>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : data && data.totalEntries === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No data yet. Log some entries to unlock analytics.
          </CardContent>
        </Card>
      ) : (
        data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total entries" value={data.totalEntries} icon={BarChart3} />
              <StatCard label="Projects" value={data.projects.length} icon={FolderGit2} />
              <StatCard label="Technologies" value={data.technologies.length} icon={Cpu} />
              <StatCard
                label="Most active month"
                value={data.mostActiveMonth?.label ?? "—"}
                hint={data.mostActiveMonth ? `${data.mostActiveMonth.count} entries` : undefined}
                icon={CalendarRange}
              />
            </div>
            <AnalyticsCharts data={data} />
          </>
        )
      )}
    </div>
  );
}
