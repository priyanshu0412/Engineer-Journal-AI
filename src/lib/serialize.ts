import "server-only";
import type {
  JournalEntryDTO,
  MonthlyReportDTO,
  WeeklyReportDTO,
  AIProcessedEntry,
} from "@/types";

/** Lean Mongoose docs are untyped enough that a light `any` keeps mappers readable. */
/* eslint-disable @typescript-eslint/no-explicit-any */

function iso(d: any): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

function ai(a: any): AIProcessedEntry {
  return {
    detectedLanguages: a?.detectedLanguages ?? [],
    professionalSummary: a?.professionalSummary ?? "",
    tasks: a?.tasks ?? [],
    keyAchievements: a?.keyAchievements ?? [],
    learnings: a?.learnings ?? [],
    challenges: a?.challenges ?? [],
    technologies: a?.technologies ?? [],
  };
}

export function serializeEntry(doc: any): JournalEntryDTO {
  return {
    id: String(doc._id),
    userId: doc.userId,
    date: iso(doc.date),
    projectName: doc.projectName,
    rawNotes: doc.rawNotes,
    rawChallenges: doc.rawChallenges || undefined,
    rawLearnings: doc.rawLearnings || undefined,
    ai: ai(doc.ai),
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
  };
}

export function serializeWeekly(doc: any): WeeklyReportDTO {
  return {
    id: String(doc._id),
    userId: doc.userId,
    weekStart: iso(doc.weekStart),
    weekEnd: iso(doc.weekEnd),
    isoWeek: doc.isoWeek,
    isoYear: doc.isoYear,
    rows: (doc.rows ?? []).map((r: any) => ({
      date: iso(r.date),
      day: r.day,
      project: r.project,
      tasksCompleted: r.tasksCompleted ?? [],
      challenges: r.challenges ?? [],
      learnings: r.learnings ?? [],
      technologies: r.technologies ?? [],
    })),
    summary: {
      projectsWorkedOn: doc.summary?.projectsWorkedOn ?? [],
      featuresCompleted: doc.summary?.featuresCompleted ?? [],
      bugsFixed: doc.summary?.bugsFixed ?? [],
      documentationUpdates: doc.summary?.documentationUpdates ?? [],
      majorAchievements: doc.summary?.majorAchievements ?? [],
      challengesFaced: doc.summary?.challengesFaced ?? [],
      learnings: doc.summary?.learnings ?? [],
      technologiesUsed: doc.summary?.technologiesUsed ?? [],
      narrative: doc.summary?.narrative ?? "",
    },
    createdAt: iso(doc.createdAt),
  };
}

export function serializeMonthly(doc: any): MonthlyReportDTO {
  return {
    id: String(doc._id),
    userId: doc.userId,
    month: doc.month,
    year: doc.year,
    totalWorkingDays: doc.totalWorkingDays ?? 0,
    summary: {
      projectsWorkedOn: doc.summary?.projectsWorkedOn ?? [],
      featuresCompleted: doc.summary?.featuresCompleted ?? [],
      bugsFixed: doc.summary?.bugsFixed ?? [],
      documentationUpdates: doc.summary?.documentationUpdates ?? [],
      majorAchievements: doc.summary?.majorAchievements ?? [],
      challengesFaced: doc.summary?.challengesFaced ?? [],
      learnings: doc.summary?.learnings ?? [],
      technologiesUsed: doc.summary?.technologiesUsed ?? [],
      narrative: doc.summary?.narrative ?? "",
    },
    aiPerformanceAnalysis: doc.aiPerformanceAnalysis ?? "",
    createdAt: iso(doc.createdAt),
  };
}
