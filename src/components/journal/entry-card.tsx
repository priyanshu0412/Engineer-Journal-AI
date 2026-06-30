"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2, CheckCircle2, Trophy, Brain, AlertTriangle, FolderGit } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EntryForm } from "@/components/journal/entry-form";
import { deleteEntry } from "@/actions/journal";
import { formatReportDate, weekdayName, cn } from "@/lib/utils";
import type { JournalEntryDTO } from "@/types";

const SECTION_THEMES = {
  tasks: {
    icon: CheckCircle2,
    bg: "bg-blue-500/[0.03] dark:bg-blue-500/[0.06]",
    border: "border-blue-500/10 dark:border-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    bullet: "text-blue-500",
  },
  achievements: {
    icon: Trophy,
    bg: "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]",
    border: "border-emerald-500/10 dark:border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    bullet: "text-emerald-500",
  },
  learnings: {
    icon: Brain,
    bg: "bg-amber-500/[0.03] dark:bg-amber-500/[0.06]",
    border: "border-amber-500/10 dark:border-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    bullet: "text-amber-500",
  },
  challenges: {
    icon: AlertTriangle,
    bg: "bg-rose-500/[0.03] dark:bg-rose-500/[0.06]",
    border: "border-rose-500/10 dark:border-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    bullet: "text-rose-500",
  },
};

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  const key = title.toLowerCase() as keyof typeof SECTION_THEMES;
  const theme = SECTION_THEMES[key] || {
    icon: CheckCircle2,
    bg: "bg-muted/40",
    border: "border-border",
    text: "text-foreground",
    bullet: "text-muted-foreground",
  };
  const Icon = theme.icon;

  return (
    <div className={cn("p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-sm", theme.bg, theme.border)}>
      <div className="flex items-center gap-2 mb-2.5">
        <div className={cn("p-1 rounded-md bg-background border", theme.border, theme.text)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <p className={cn("text-[10px] font-bold uppercase tracking-wider", theme.text)}>{title}</p>
      </div>
      <ul className="space-y-1.5 text-xs text-muted-foreground font-medium leading-relaxed pl-0.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={cn("font-extrabold select-none mt-0.5", theme.bullet)}>•</span>
            <span className="text-foreground/95">{it}</span>
          </li>
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
        toast.success("Entry deleted successfully.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed.");
      }
    });
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 bg-card/65 backdrop-blur-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 pb-3 border-b border-muted-foreground/5 bg-muted/10">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <FolderGit className="w-4 h-4 text-primary" />
              {entry.projectName}
            </div>
            <span className="text-muted-foreground/30 font-medium">|</span>
            <Badge variant="secondary" className="px-2 py-0 text-[10px] font-semibold tracking-wide">
              {formatReportDate(entry.date)}
            </Badge>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {weekdayName(entry.date)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {entry.ai.detectedLanguages.map((l) => (
              <Badge key={l} variant="outline" className="text-[9px] px-1.5 py-0 font-medium text-muted-foreground bg-background/50">
                {l}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center self-end sm:self-center gap-1">
          <EntryForm
            entry={entry}
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="Edit entry">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            }
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors" aria-label="Delete entry" onClick={remove} disabled={pending}>
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 space-y-4">
        {entry.ai.professionalSummary && (
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Polished Summary</h4>
            <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 font-medium bg-muted/20 border border-muted-foreground/5 rounded-xl p-3.5">
              {entry.ai.professionalSummary}
            </p>
          </div>
        )}
        
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Section title="Tasks" items={entry.ai.tasks} />
          <Section title="Achievements" items={entry.ai.keyAchievements} />
          <Section title="Learnings" items={entry.ai.learnings} />
          <Section title="Challenges" items={entry.ai.challenges} />
        </div>
        
        {entry.ai.technologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-muted-foreground/5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Technologies:</span>
            {entry.ai.technologies.map((t) => (
              <Badge key={t} variant="secondary" className="text-[9px] font-mono px-2 py-0 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 transition-colors">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

