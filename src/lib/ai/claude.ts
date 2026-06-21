import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import type { AIProcessedEntry, ReportSummary } from "@/types";
import { aiProvider, useMockAI } from "@/lib/config";
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

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set. Add it to .env.local.");
  }
  _client ??= new Anthropic();
  return _client;
}

const stringArray = (description: string) => ({
  type: "array" as const,
  items: { type: "string" as const },
  description,
});

// JSON Schemas for the forced-tool extraction. Forcing a single tool guarantees
// Claude returns a structured object matching this shape (works on every SDK
// version, unlike the newer output_config.format helper).
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

/**
 * Run a forced-tool extraction and validate the result against a Zod schema.
 * Returns the validated object, or `null` if the model produced nothing usable.
 */
async function extract<S extends z.ZodTypeAny>(opts: {
  system: string;
  userContent: string;
  toolName: string;
  toolDescription: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputSchema: any;
  schema: S;
  maxTokens?: number;
}): Promise<z.infer<S> | null> {
  // Route to Gemini (free tier) when selected; falls back to Claude otherwise.
  if (aiProvider() === "gemini") {
    return geminiExtract({
      system: opts.system,
      userContent: opts.userContent,
      inputSchema: opts.inputSchema,
      schema: opts.schema,
      maxTokens: opts.maxTokens,
    });
  }

  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 4096,
    system: opts.system,
    tools: [
      {
        name: opts.toolName,
        description: opts.toolDescription,
        input_schema: opts.inputSchema,
      },
    ],
    tool_choice: { type: "tool", name: opts.toolName },
    messages: [{ role: "user", content: opts.userContent }],
  });

  const block = msg.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") return null;
  const parsed = opts.schema.safeParse(block.input);
  return parsed.success ? parsed.data : null;
}

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

  const result = await extract({
    system: ENTRY_SYSTEM_PROMPT,
    userContent,
    toolName: "record_journal_entry",
    toolDescription: "Record the structured, professionalized version of the developer's note.",
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

  const result = await extract({
    system: WEEKLY_SYSTEM_PROMPT,
    userContent: `Here are this week's entries as JSON:\n${JSON.stringify(entries, null, 2)}`,
    toolName: "record_weekly_summary",
    toolDescription: "Record the aggregated weekly report summary.",
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

  const result = await extract({
    system: MONTHLY_SYSTEM_PROMPT,
    userContent: `Here are this month's entries as JSON:\n${JSON.stringify(entries, null, 2)}`,
    toolName: "record_monthly_report",
    toolDescription: "Record the aggregated monthly report and performance analysis.",
    inputSchema: MONTHLY_SCHEMA,
    schema: monthlyAnalysisSchema,
    maxTokens: 6000,
  });
  return result ?? { ...emptySummary(), aiPerformanceAnalysis: "" };
}
