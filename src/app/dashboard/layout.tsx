import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ensureUser } from "@/lib/auth";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { TopbarUser } from "@/components/auth/auth-controls";
import { MOCK_MODE } from "@/lib/config";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Sync the Clerk user into MongoDB on every dashboard load (cheap upsert).
  await ensureUser();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-5 font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          DevTrack AI
        </div>
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold md:hidden">
            <Sparkles className="h-5 w-5 text-primary" />
            DevTrack AI
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
            <TopbarUser />
          </div>
        </header>
        {MOCK_MODE && (
          <div className="border-b bg-amber-500/10 px-4 py-1.5 text-center text-xs text-amber-700 dark:text-amber-400 md:px-6">
            Development mode — mock AI, in-memory database, no real credentials. Data resets on restart.
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
