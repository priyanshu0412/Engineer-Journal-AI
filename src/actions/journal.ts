"use server";

import { requireUserId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb/connect";
import { JournalEntry } from "@/models/JournalEntry";
import { processJournalEntry } from "@/lib/ai/claude";
import { serializeEntry } from "@/lib/serialize";
import type { JournalEntryDTO } from "@/types";

export interface EntryInput {
  date: string; // YYYY-MM-DD
  projectName: string;
  rawNotes: string;
  rawChallenges?: string;
  rawLearnings?: string;
}

function validate(input: EntryInput) {
  if (!input.projectName?.trim()) throw new Error("Project name is required.");
  if (!input.rawNotes?.trim()) throw new Error("Daily notes are required.");
  if (!input.date) throw new Error("Date is required.");
}

/** Create an entry: run it through Claude, then persist the structured result. */
export async function createEntry(input: EntryInput): Promise<JournalEntryDTO> {
  const userId = await requireUserId();
  validate(input);
  await connectDB();

  const ai = await processJournalEntry({
    date: input.date,
    projectName: input.projectName,
    rawNotes: input.rawNotes,
    rawChallenges: input.rawChallenges,
    rawLearnings: input.rawLearnings,
  });

  const doc = await JournalEntry.create({
    userId,
    date: new Date(input.date),
    projectName: input.projectName.trim(),
    rawNotes: input.rawNotes.trim(),
    rawChallenges: input.rawChallenges?.trim() ?? "",
    rawLearnings: input.rawLearnings?.trim() ?? "",
    ai,
  });

  return serializeEntry(doc.toObject());
}

/** Update an entry; re-runs AI processing on the (possibly changed) notes. */
export async function updateEntry(id: string, input: EntryInput): Promise<JournalEntryDTO> {
  const userId = await requireUserId();
  validate(input);
  await connectDB();

  const ai = await processJournalEntry({
    date: input.date,
    projectName: input.projectName,
    rawNotes: input.rawNotes,
    rawChallenges: input.rawChallenges,
    rawLearnings: input.rawLearnings,
  });

  const doc = await JournalEntry.findOneAndUpdate(
    { _id: id, userId },
    {
      $set: {
        date: new Date(input.date),
        projectName: input.projectName.trim(),
        rawNotes: input.rawNotes.trim(),
        rawChallenges: input.rawChallenges?.trim() ?? "",
        rawLearnings: input.rawLearnings?.trim() ?? "",
        ai,
      },
    },
    { new: true },
  ).lean();

  if (!doc) throw new Error("Entry not found.");
  return serializeEntry(doc);
}

export async function deleteEntry(id: string): Promise<{ ok: true }> {
  const userId = await requireUserId();
  await connectDB();
  await JournalEntry.deleteOne({ _id: id, userId });
  return { ok: true };
}

export interface EntryFilters {
  search?: string;
  project?: string;
  from?: string; // YYYY-MM-DD
  to?: string;
}

/** List a user's entries with optional search / project / date filters. */
export async function listEntries(filters: EntryFilters = {}): Promise<JournalEntryDTO[]> {
  const userId = await requireUserId();
  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = { userId };
  if (filters.project) query.projectName = filters.project;
  if (filters.from || filters.to) {
    query.date = {};
    if (filters.from) query.date.$gte = new Date(filters.from);
    if (filters.to) {
      const end = new Date(filters.to);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }
  if (filters.search?.trim()) {
    const rx = new RegExp(filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { rawNotes: rx },
      { projectName: rx },
      { "ai.professionalSummary": rx },
      { "ai.tasks": rx },
      { "ai.technologies": rx },
    ];
  }

  const docs = await JournalEntry.find(query).sort({ date: -1 }).limit(500).lean();
  return docs.map(serializeEntry);
}

/** Distinct project names for filter dropdowns. */
export async function listProjects(): Promise<string[]> {
  const userId = await requireUserId();
  await connectDB();
  const names = await JournalEntry.distinct("projectName", { userId });
  return (names as string[]).sort();
}
