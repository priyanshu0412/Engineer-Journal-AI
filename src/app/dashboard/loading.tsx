export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-2">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-md bg-muted/60" />
          <div className="h-4 w-72 rounded-md bg-muted/50" />
        </div>
        <div className="h-9 w-28 rounded-md bg-muted/60" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-muted/50" />
              <div className="h-4 w-4 rounded-full bg-muted/60" />
            </div>
            <div className="space-y-1">
              <div className="h-7 w-20 rounded bg-muted/60" />
              <div className="h-3 w-32 rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Side (Journal Entries / Content) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-muted/60" />
            <div className="h-4 w-16 rounded bg-muted/50" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-40 rounded bg-muted/60" />
                <div className="h-4 w-24 rounded bg-muted/50" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted/40" />
                <div className="h-4 w-5/6 rounded bg-muted/40" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="h-6 w-16 rounded bg-muted/50" />
                <div className="h-6 w-20 rounded bg-muted/50" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Side (Reports / Info) */}
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
              <div className="h-4.5 w-36 rounded bg-muted/60" />
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded bg-muted/45" />
                <div className="h-3.5 w-full rounded bg-muted/45" />
                <div className="h-3.5 w-4/5 rounded bg-muted/45" />
              </div>
              <div className="h-4 w-24 rounded bg-muted/50 pt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
