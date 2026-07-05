import "server-only";
import type { z } from "zod";
import type { AIProcessedEntry, ReportSummary } from "@/types";
import { useMockAI } from "@/lib/config";
import {
  ENTRY_SYSTEM_PROMPT,
  MONTHLY_SYSTEM_PROMPT,
  WEEKLY_SYSTEM_PROMPT,
} from "./prompts";
import {
  monthlyAnalysisSchema,
  processedEntrySchema,
  reportSummarySchema,
} from "./schemas";
import { mockMonthlyAnalysis, mockProcessEntry, mockWeeklySummary } from "./mock";
import { geminiExtract } from "./gemini";
import { emptySummary } from "@/lib/reports/empty";

const stringArray = (description: string) => ({
  type: "array" as const,
  items: { type: "string" as const },
  description,
});

// JSON Schemas for the forced-tool extraction. Reused by Gemini for structured JSON outputs.
const ENTRY_SCHEMA = {
  type: "object" as const,
  properties: {
    detectedLanguages: stringArray("Languages detected (English, Hindi, Gujarati, Hinglish, …)."),
    professionalSummary: { type: "string" as const, description: "Professional English summary." },
    tasks: stringArray("Concrete tasks completed."),
    keyAchievements: stringArray("Achievements phrased for a resume/appraisal."),
    learnings: stringArray("Things learned."),
    challenges: stringArray("Challenges or blockers faced."),
    technologies: stringArray("Technologies, frameworks, or tools used."),
  },
  required: [
    "detectedLanguages",
    "professionalSummary",
    "tasks",
    "keyAchievements",
    "learnings",
    "challenges",
    "technologies",
  ],
};

const SUMMARY_PROPS = {
  projectsWorkedOn: stringArray("Projects worked on."),
  featuresCompleted: stringArray("Features completed/shipped."),
  bugsFixed: stringArray("Bugs fixed."),
  documentationUpdates: stringArray("Documentation updates."),
  majorAchievements: stringArray("Major achievements."),
  challengesFaced: stringArray("Challenges faced."),
  learnings: stringArray("Learnings."),
  technologiesUsed: stringArray("Technologies used."),
  narrative: { type: "string" as const, description: "Manager/appraisal-ready narrative paragraph." },
};
const SUMMARY_REQUIRED = Object.keys(SUMMARY_PROPS);

const WEEKLY_SCHEMA = {
  type: "object" as const,
  properties: SUMMARY_PROPS,
  required: SUMMARY_REQUIRED,
};

const MONTHLY_SCHEMA = {
  type: "object" as const,
  properties: {
    ...SUMMARY_PROPS,
    aiPerformanceAnalysis: {
      type: "string" as const,
      description: "Analytical paragraph on focus, productivity, and growth over the month.",
    },
  },
  required: [...SUMMARY_REQUIRED, "aiPerformanceAnalysis"],
};

export interface RawEntryInput {
  date: string;
  projectName: string;
  rawNotes: string;
  rawChallenges?: string;
  rawLearnings?: string;
}

/** Detect language, translate, and extract structured fields from one raw note. */
export async function processJournalEntry(input: RawEntryInput): Promise<AIProcessedEntry> {
  if (useMockAI()) return mockProcessEntry(input);

  const userContent = [
    `Date: ${input.date}`,
    `Project: ${input.projectName}`,
    "",
    "Raw daily notes (any language):",
    input.rawNotes,
    input.rawChallenges ? `\nUser-noted challenges:\n${input.rawChallenges}` : "",
    input.rawLearnings ? `\nUser-noted learnings:\n${input.rawLearnings}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await geminiExtract({
    system: ENTRY_SYSTEM_PROMPT,
    userContent,
    inputSchema: ENTRY_SCHEMA,
    schema: processedEntrySchema,
  });

  if (!result) {
    // Honest fallback rather than throwing in the UI path.
    return {
      detectedLanguages: [],
      professionalSummary: input.rawNotes,
      tasks: [],
      keyAchievements: [],
      learnings: input.rawLearnings ? [input.rawLearnings] : [],
      challenges: input.rawChallenges ? [input.rawChallenges] : [],
      technologies: [],
    };
  }
  return result;
}

/** Aggregate a week of already-processed entries into a professional summary. */
export async function generateWeeklySummary(
  entries: { date: string; project: string; ai: AIProcessedEntry }[],
): Promise<ReportSummary> {
  if (useMockAI()) return mockWeeklySummary(entries);

  const result = await geminiExtract({
    system: WEEKLY_SYSTEM_PROMPT,
    userContent: `Here are this week's entries as JSON:\n${JSON.stringify(entries, null, 2)}`,
    inputSchema: WEEKLY_SCHEMA,
    schema: reportSummarySchema,
  });
  return result ?? emptySummary();
}

/** Analyze a month of entries; returns the summary plus a performance analysis. */
export async function generateMonthlyAnalysis(
  entries: { date: string; project: string; ai: AIProcessedEntry }[],
): Promise<ReportSummary & { aiPerformanceAnalysis: string }> {
  if (useMockAI()) return mockMonthlyAnalysis(entries);

  const result = await geminiExtract({
    system: MONTHLY_SYSTEM_PROMPT,
    userContent: `Here are this month's entries as JSON:\n${JSON.stringify(entries, null, 2)}`,
    inputSchema: MONTHLY_SCHEMA,
    schema: monthlyAnalysisSchema,
    maxTokens: 6000,
  });
  return result ?? { ...emptySummary(), aiPerformanceAnalysis: "" };
}
