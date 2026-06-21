import { listEntries, listProjects } from "@/actions/journal";
import { EntryForm } from "@/components/journal/entry-form";
import { EntryCard } from "@/components/journal/entry-card";
import { JournalFilters } from "@/components/journal/journal-filters";
import { Card, CardContent } from "@/components/ui/card";
import type { JournalEntryDTO } from "@/types";

export const dynamic = "force-dynamic";

type SP = Promise<{ search?: string; project?: string; from?: string; to?: string }>;

export default async function JournalPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  let entries: JournalEntryDTO[] = [];
  let projects: string[] = [];
  let error: string | null = null;
  try {
    [entries, projects] = await Promise.all([
      listEntries({ search: sp.search, project: sp.project, from: sp.from, to: sp.to }),
      listProjects(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load entries.";
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
          <p className="text-sm text-muted-foreground">
            {error ? "—" : `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
          </p>
        </div>
        <EntryForm />
      </div>

      <JournalFilters projects={projects} />

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No entries match. Try adjusting filters, or log a new entry.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
