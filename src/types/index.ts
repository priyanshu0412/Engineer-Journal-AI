/**
 * Shared application types for DevTrack AI.
 * These mirror the Mongoose model shapes but use plain serializable fields
 * so they can cross the server/client boundary (e.g. through Server Actions).
 */

export type ExportFormat = "pdf" | "xlsx" | "csv" | "markdown";

/** The structured result Claude returns for a single raw journal note. */
export interface AIProcessedEntry {
  detectedLanguages: string[];
  professionalSummary: string;
  tasks: string[];
  keyAchievements: string[];
  learnings: string[];
  challenges: string[];
  technologies: string[];
}

export interface JournalEntryDTO {
  id: string;
  userId: string;
  date: string; // ISO
  projectName: string;
  rawNotes: string;
  /** Optional user-supplied fields — the AI augments these. */
  rawChallenges?: string;
  rawLearnings?: string;
  ai: AIProcessedEntry;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReportRow {
  date: string; // ISO
  day: string; // "Monday"
  project: string;
  tasksCompleted: string[];
  challenges: string[];
  learnings: string[];
  technologies: string[];
}

export interface ReportSummary {
  projectsWorkedOn: string[];
  featuresCompleted: string[];
  bugsFixed: string[];
  documentationUpdates: string[];
  majorAchievements: string[];
  challengesFaced: string[];
  learnings: string[];
  technologiesUsed: string[];
  /** Narrative paragraph suitable for manager updates / appraisals. */
  narrative: string;
}

export interface WeeklyReportDTO {
  id: string;
  userId: string;
  weekStart: string; // ISO (Monday)
  weekEnd: string; // ISO (Sunday)
  isoWeek: number;
  isoYear: number;
  rows: WeeklyReportRow[];
  summary: ReportSummary;
  createdAt: string;
}

export interface MonthlyReportDTO {
  id: string;
  userId: string;
  month: number; // 0-11
  year: number;
  totalWorkingDays: number;
  summary: ReportSummary;
  /** AI's analysis of productivity / focus for the month. */
  aiPerformanceAnalysis: string;
  createdAt: string;
}

export interface DashboardStats {
  currentStreak: number;
  totalEntries: number;
  currentMonthActivity: number;
  recentEntries: JournalEntryDTO[];
  lastWeeklyReport: WeeklyReportDTO | null;
  lastMonthlyReport: MonthlyReportDTO | null;
}

export interface AnalyticsData {
  projects: { name: string; count: number }[];
  technologies: { name: string; count: number }[];
  mostActiveMonth: { label: string; count: number } | null;
  learningTrend: { period: string; count: number }[];
  challengeTrend: { period: string; count: number }[];
  totalEntries: number;
}
