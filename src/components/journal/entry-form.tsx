"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Sparkles, Mic, MicOff, Github } from "lucide-react";
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
import { transcribeAudio, fetchGithubActivity } from "@/actions/integrations";
import { toDateInputValue, cn } from "@/lib/utils";
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

  const [isRecording, setIsRecording] = React.useState(false);
  const [isFetchingGit, setIsFetchingGit] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const options = MediaRecorder.isTypeSupported("audio/webm")
        ? { mimeType: "audio/webm" }
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? { mimeType: "audio/mp4" }
        : undefined;

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const recordedMimeType = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: recordedMimeType });
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(",")[1];
          toast.promise(
            async () => {
              const text = await transcribeAudio(base64Audio, recordedMimeType);
              if (text) {
                setForm((prev) => ({
                  ...prev,
                  rawNotes: prev.rawNotes ? `${prev.rawNotes}\n${text}` : text
                }));
              } else {
                throw new Error("Could not transcribe audio. Speech might be unclear.");
              }
            },
            {
              loading: "Transcribing your audio standup...",
              success: "Audio transcribed successfully!",
              error: (err) => err instanceof Error ? err.message : "Failed to transcribe",
            }
          );
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording standup note... Click stop when finished.");
    } catch (err) {
      toast.error("Microphone access denied or unsupported.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  async function loadGithubActivity() {
    setIsFetchingGit(true);
    toast.promise(
      async () => {
        const activity = await fetchGithubActivity(form.date);
        if (activity) {
          if (activity.startsWith("GitHub Integration:")) {
            throw new Error(activity);
          }
          setForm((prev) => ({
            ...prev,
            rawNotes: prev.rawNotes ? `${prev.rawNotes}\n\n${activity}` : activity
          }));
          return "Autofilled from GitHub!";
        } else {
          throw new Error("No activity found for this date.");
        }
      },
      {
        loading: "Fetching your GitHub commits/PRs...",
        success: (data) => data,
        error: (err) => err instanceof Error ? err.message : "Failed to fetch",
      }
    );
    setIsFetchingGit(false);
  }

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

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notes" className="text-xs font-semibold text-muted-foreground">Raw daily notes</Label>
              <div className="flex gap-1.5">
                {/* Voice Journaling Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={cn(
                    "h-7 text-[10px] font-semibold px-2 rounded-lg border-muted-foreground/10 hover:border-primary/30 transition-all duration-300",
                    isRecording && "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20"
                  )}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3 h-3 mr-1 animate-pulse text-rose-500" />
                      Stop recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3 mr-1 text-primary" />
                      Record voice
                    </>
                  )}
                </Button>

                {/* GitHub Fetch Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isFetchingGit}
                  onClick={loadGithubActivity}
                  className="h-7 text-[10px] font-semibold px-2 rounded-lg border-muted-foreground/10 hover:border-primary/30 hover:bg-muted transition-all duration-300"
                >
                  {isFetchingGit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Github className="w-3 h-3 mr-1 text-foreground" />
                      Autofill GitHub
                    </>
                  )}
                </Button>
              </div>
            </div>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Aaje login nu bug fix karyu. JWT refresh token ma issue hato… or pull activity from GitHub / record voice."
              value={form.rawNotes}
              onChange={(e) => set("rawNotes", e.target.value)}
              className="bg-background border-muted-foreground/10 focus:border-primary/50 transition-colors"
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
