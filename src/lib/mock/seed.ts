import "server-only";
import { JournalEntry } from "@/models/JournalEntry";
import { mockProcessEntry } from "@/lib/ai/mock";
import { DEV_USER_ID } from "@/lib/config";

const SAMPLES: { daysAgo: number; project: string; notes: string; learnings?: string; challenges?: string }[] = [
  {
    daysAgo: 1,
    project: "School ERP",
    notes: "Aaje login nu bug fix karyu. JWT refresh token ma issue hato. Documentation pan update kari.",
    challenges: "Token expiry handling was tricky",
    learnings: "Learned how JWT refresh rotation works",
  },
  {
    daysAgo: 2,
    project: "School ERP",
    notes: "Aaj auth wala bug fix kiya aur refresh token issue solve kiya. Secure cookie strategy implement ki.",
    challenges: "Cookie handling across subdomains",
  },
  {
    daysAgo: 3,
    project: "Analytics Dashboard",
    notes: "Built the charts page with Recharts. Added bar and line charts for technologies and trends.",
    learnings: "Recharts responsive container patterns",
  },
  {
    daysAgo: 4,
    project: "Analytics Dashboard",
    notes: "Implemented MongoDB aggregation for monthly stats. Optimized queries with indexes.",
  },
  {
    daysAgo: 6,
    project: "DevTrack AI",
    notes: "Integrated Claude API for entry processing. Added structured output extraction and tested with Hinglish notes.",
    learnings: "Forced tool use guarantees structured JSON",
  },
  {
    daysAgo: 7,
    project: "DevTrack AI",
    notes: "Created PDF and Excel export. Fixed a bug in the weekly report aggregation logic.",
    challenges: "Excel multi-sheet layout alignment",
  },
];

/**
 * Seed a handful of demo entries for the dev user (mock mode only), so the
 * dashboard, reports, and analytics have something to show out of the box.
 * No-op if entries already exist.
 */
export async function seedMockData(): Promise<void> {
  const existing = await JournalEntry.countDocuments({ userId: DEV_USER_ID });
  if (existing > 0) return;

  const now = new Date();
  const docs = SAMPLES.map((s) => {
    const date = new Date(now);
    date.setDate(now.getDate() - s.daysAgo);
    date.setHours(17, 0, 0, 0);
    return {
      userId: DEV_USER_ID,
      date,
      projectName: s.project,
      rawNotes: s.notes,
      rawChallenges: s.challenges ?? "",
      rawLearnings: s.learnings ?? "",
      ai: mockProcessEntry({
        date: date.toISOString().slice(0, 10),
        projectName: s.project,
        rawNotes: s.notes,
        rawChallenges: s.challenges,
        rawLearnings: s.learnings,
      }),
    };
  });

  await JournalEntry.insertMany(docs);
}
