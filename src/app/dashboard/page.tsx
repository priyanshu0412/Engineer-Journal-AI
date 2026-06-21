import Link from "next/link";
import { Activity, CalendarCheck, Flame, NotebookPen, ArrowRight } from "lucide-react";
import { requireUserId } from "@/lib/auth";
import { getDashboardStats } from "@/lib/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { EntryForm } from "@/components/journal/entry-form";
import { EntryCard } from "@/components/journal/entry-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMonthLabel } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats: DashboardStats | null = null;
  let error: string | null = null;
  try {
    const userId = await requireUserId();
    stats = await getDashboardStats(userId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load dashboard.";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your engineering work at a glance.</p>
        </div>
        <EntryForm />
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Couldn&apos;t load your data: <span className="text-foreground">{error}</span>. Make sure
            your <code>MONGODB_URI</code> and other keys are set in <code>.env.local</code>.
          </CardContent>
        </Card>
      ) : (
        stats && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Current streak" value={`${stats.currentStreak} ${stats.currentStreak === 1 ? "day" : "days"}`} icon={Flame} hint="Consecutive logged days" />
              <StatCard label="Total entries" value={stats.totalEntries} icon={NotebookPen} />
              <StatCard label="This month" value={stats.currentMonthActivity} icon={CalendarCheck} hint="Entries logged" />
              <StatCard label="Recent activity" value={stats.recentEntries.length} icon={Activity} hint="Last 5 entries" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-3 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Recent entries</h2>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/journal">
                      View all <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                {stats.recentEntries.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                      No entries yet. Log your first day of work to get started.
                    </CardContent>
                  </Card>
                ) : (
                  stats.recentEntries.map((e) => <EntryCard key={e.id} entry={e} />)
                )}
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Last weekly report</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {stats.lastWeeklyReport ? (
                      <div className="space-y-2">
                        <p className="text-foreground">
                          Week {stats.lastWeeklyReport.isoWeek}, {stats.lastWeeklyReport.isoYear}
                        </p>
                        <p className="line-clamp-4">{stats.lastWeeklyReport.summary.narrative || "—"}</p>
                        <Button asChild variant="link" className="h-auto p-0">
                          <Link href="/dashboard/reports">Open reports</Link>
                        </Button>
                      </div>
                    ) : (
                      <p>No weekly report yet. Generate one from the Reports page.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Last monthly report</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {stats.lastMonthlyReport ? (
                      <div className="space-y-2">
                        <p className="text-foreground">
                          {formatMonthLabel(
                            stats.lastMonthlyReport.year,
                            stats.lastMonthlyReport.month,
                          )}
                        </p>
                        <p className="line-clamp-4">
                          {stats.lastMonthlyReport.aiPerformanceAnalysis || "—"}
                        </p>
                      </div>
                    ) : (
                      <p>No monthly report yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
