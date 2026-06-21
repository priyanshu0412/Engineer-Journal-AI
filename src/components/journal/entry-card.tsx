"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EntryForm } from "@/components/journal/entry-form";
import { deleteEntry } from "@/actions/journal";
import { formatReportDate, weekdayName } from "@/lib/utils";
import type { JournalEntryDTO } from "@/types";

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export function EntryCard({ entry }: { entry: JournalEntryDTO }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function remove() {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteEntry(entry.id);
        toast.success("Entry deleted.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed.");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{entry.projectName}</span>
            <Badge variant="secondary">{formatReportDate(entry.date)}</Badge>
            <span className="text-xs text-muted-foreground">{weekdayName(entry.date)}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {entry.ai.detectedLanguages.map((l) => (
              <Badge key={l} variant="outline" className="text-[10px]">
                {l}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <EntryForm
            entry={entry}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Edit entry">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <Button variant="ghost" size="icon" aria-label="Delete entry" onClick={remove} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {entry.ai.professionalSummary && (
          <p className="text-sm leading-relaxed">{entry.ai.professionalSummary}</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Section title="Tasks" items={entry.ai.tasks} />
          <Section title="Achievements" items={entry.ai.keyAchievements} />
          <Section title="Learnings" items={entry.ai.learnings} />
          <Section title="Challenges" items={entry.ai.challenges} />
        </div>
        {entry.ai.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {entry.ai.technologies.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
