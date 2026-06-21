"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEntry, updateEntry, type EntryInput } from "@/actions/journal";
import { toDateInputValue } from "@/lib/utils";
import type { JournalEntryDTO } from "@/types";

interface Props {
  /** If provided, the form edits this entry instead of creating a new one. */
  entry?: JournalEntryDTO;
  trigger?: React.ReactNode;
}

export function EntryForm({ entry, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const [form, setForm] = React.useState<EntryInput>(() => ({
    date: entry ? toDateInputValue(entry.date) : toDateInputValue(new Date()),
    projectName: entry?.projectName ?? "",
    rawNotes: entry?.rawNotes ?? "",
    rawChallenges: entry?.rawChallenges ?? "",
    rawLearnings: entry?.rawLearnings ?? "",
  }));

  function set<K extends keyof EntryInput>(key: K, value: EntryInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    startTransition(async () => {
      try {
        if (entry) {
          await updateEntry(entry.id, form);
          toast.success("Entry updated and re-processed by AI.");
        } else {
          await createEntry(form);
          toast.success("Entry saved. AI processed it into a professional summary.");
        }
        setOpen(false);
        if (!entry) {
          setForm({
            date: toDateInputValue(new Date()),
            projectName: form.projectName, // keep the project for fast repeat logging
            rawNotes: "",
            rawChallenges: "",
            rawLearnings: "",
          });
        }
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" /> New entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit entry" : "Log today's work"}</DialogTitle>
          <DialogDescription>
            Write naturally in any language — English, Hindi, Gujarati, Hinglish, or a mix. The AI
            handles the rest.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="project">Project name</Label>
              <Input
                id="project"
                placeholder="e.g. School ERP"
                value={form.projectName}
                onChange={(e) => set("projectName", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="notes">Raw daily notes</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Aaje login nu bug fix karyu. JWT refresh token ma issue hato…"
              value={form.rawNotes}
              onChange={(e) => set("rawNotes", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="challenges">Challenges (optional)</Label>
              <Textarea
                id="challenges"
                rows={2}
                value={form.rawChallenges}
                onChange={(e) => set("rawChallenges", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="learnings">Learnings (optional)</Label>
              <Textarea
                id="learnings"
                rows={2}
                value={form.rawLearnings}
                onChange={(e) => set("rawLearnings", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> {entry ? "Save & re-process" : "Save with AI"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
