import { z } from "zod";

/**
 * Structured-output schemas for Claude. Kept free of unsupported JSON-Schema
 * constraints (no min/max length) so they validate server-side cleanly.
 */

export const processedEntrySchema = z.object({
  detectedLanguages: z
    .array(z.string())
    .describe("Languages detected in the raw notes, e.g. English, Hindi, Gujarati, Hinglish."),
  professionalSummary: z
    .string()
    .describe("A clean, professional English paragraph summarizing the day's work."),
  tasks: z.array(z.string()).describe("Concrete tasks the developer completed."),
  keyAchievements: z
    .array(z.string())
    .describe("Notable achievements phrased for a resume or appraisal."),
  learnings: z.array(z.string()).describe("Things the developer learned."),
  challenges: z.array(z.string()).describe("Challenges or blockers faced."),
  technologies: z
    .array(z.string())
    .describe("Technologies, languages, frameworks, or tools used (e.g. Next.js, Node.js, JWT)."),
});

export type ProcessedEntry = z.infer<typeof processedEntrySchema>;

export const reportSummarySchema = z.object({
  projectsWorkedOn: z.array(z.string()),
  featuresCompleted: z.array(z.string()),
  bugsFixed: z.array(z.string()),
  documentationUpdates: z.array(z.string()),
  majorAchievements: z.array(z.string()),
  challengesFaced: z.array(z.string()),
  learnings: z.array(z.string()),
  technologiesUsed: z.array(z.string()),
  narrative: z
    .string()
    .describe("A professional narrative paragraph suitable for a manager update or appraisal."),
});

export type ReportSummaryResult = z.infer<typeof reportSummarySchema>;

export const monthlyAnalysisSchema = reportSummarySchema.extend({
  aiPerformanceAnalysis: z
    .string()
    .describe("An analytical paragraph on focus areas, productivity, and growth over the month."),
});

export type MonthlyAnalysisResult = z.infer<typeof monthlyAnalysisSchema>;
