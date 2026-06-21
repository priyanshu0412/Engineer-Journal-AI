import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { AIProcessedSchema } from "./AIProcessed";

const JournalEntrySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    projectName: { type: String, required: true, index: true },
    rawNotes: { type: String, required: true },
    rawChallenges: { type: String, default: "" },
    rawLearnings: { type: String, default: "" },
    ai: { type: AIProcessedSchema, default: () => ({}) },
  },
  { timestamps: true },
);

// Common query: a user's entries within a date range, newest first.
JournalEntrySchema.index({ userId: 1, date: -1 });

export type JournalEntryDoc = InferSchemaType<typeof JournalEntrySchema>;

export const JournalEntry: Model<JournalEntryDoc> =
  (models.JournalEntry as Model<JournalEntryDoc>) ||
  model<JournalEntryDoc>("JournalEntry", JournalEntrySchema);
