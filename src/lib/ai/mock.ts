import type { AIProcessedEntry, ReportSummary } from "@/types";
import { uniqueStrings } from "@/lib/utils";
import type { RawEntryInput } from "./claude";

/** Known technology keywords to detect in raw notes (case-insensitive). */
const TECH_KEYWORDS: Record<string, string> = {
  jwt: "JWT",
  "next.js": "Next.js",
  nextjs: "Next.js",
  next: "Next.js",
  node: "Node.js",
  nodejs: "Node.js",
  react: "React",
  mongodb: "MongoDB",
  mongo: "MongoDB",
  mongoose: "Mongoose",
  typescript: "TypeScript",
  tailwind: "Tailwind CSS",
  clerk: "Clerk",
  resend: "Resend",
  redis: "Redis",
  docker: "Docker",
  postgres: "PostgreSQL",
  prisma: "Prisma",
  python: "Python",
  api: "REST API",
  graphql: "GraphQL",
  aws: "AWS",
  vercel: "Vercel",
};

function detectLanguages(text: string): string[] {
  const langs = new Set<string>();
  if (/[ऀ-ॿ]/.test(text)) langs.add("Hindi");
  if (/[઀-૿]/.test(text)) langs.add("Gujarati");
  // Romanized Hindi/Gujarati heuristic (Hinglish).
  if (/\b(karyu|kiya|kari|hato|nu|wala|aaje|aaj|bug|fix)\b/i.test(text) && langs.size === 0) {
    langs.add("Hinglish");
  }
  langs.add("English");
  return [...langs];
}

function detectTech(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [needle, label] of Object.entries(TECH_KEYWORDS)) {
    if (lower.includes(needle)) found.push(label);
  }
  return uniqueStrings(found);
}

function splitItems(text: string): string[] {
  return uniqueStrings(
    text
      .split(/[.;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  );
}

/** Deterministic, offline stand-in for Claude's entry processing. */
export function mockProcessEntry(input: RawEntryInput): AIProcessedEntry {
  const tasks = splitItems(input.rawNotes).slice(0, 5);
  const technologies = detectTech(
    `${input.rawNotes} ${input.rawChallenges ?? ""} ${input.rawLearnings ?? ""}`,
  );
  const learnings = input.rawLearnings ? splitItems(input.rawLearnings) : [];
  const challenges = input.rawChallenges ? splitItems(input.rawChallenges) : [];

  return {
    detectedLanguages: detectLanguages(input.rawNotes),
    professionalSummary:
      tasks.length > 0
        ? `Worked on ${input.projectName}: ${tasks.join("; ")}.`
        : `Logged work on ${input.projectName}.`,
    tasks,
    keyAchievements: tasks.slice(0, 2),
    learnings,
    challenges,
    technologies,
  };
}

function aggregate(entries: { ai: AIProcessedEntry; project: string }[]): ReportSummary {
  const projects = uniqueStrings(entries.map((e) => e.project));
  const all = (k: keyof AIProcessedEntry) =>
    uniqueStrings(entries.flatMap((e) => e.ai[k] as string[]));

  const tasks = all("tasks");
  const tech = all("technologies");
  return {
    projectsWorkedOn: projects,
    featuresCompleted: tasks.filter((t) => /implement|add|build|ship|creat|feature/i.test(t)),
    bugsFixed: tasks.filter((t) => /fix|bug|resolve|patch/i.test(t)),
    documentationUpdates: tasks.filter((t) => /doc|readme|comment/i.test(t)),
    majorAchievements: all("keyAchievements").slice(0, 5),
    challengesFaced: all("challenges"),
    learnings: all("learnings"),
    technologiesUsed: tech,
    narrative:
      entries.length > 0
        ? `Across ${entries.length} logged ${entries.length === 1 ? "day" : "days"}, work spanned ${projects.join(", ") || "several projects"}, completing ${tasks.length} tasks using ${tech.slice(0, 4).join(", ") || "various tools"}. (Generated in development mode.)`
        : "",
  };
}

export function mockWeeklySummary(
  entries: { date: string; project: string; ai: AIProcessedEntry }[],
): ReportSummary {
  return aggregate(entries);
}

export function mockMonthlyAnalysis(
  entries: { date: string; project: string; ai: AIProcessedEntry }[],
): ReportSummary & { aiPerformanceAnalysis: string } {
  const summary = aggregate(entries);
  return {
    ...summary,
    aiPerformanceAnalysis:
      entries.length > 0
        ? `This month focused primarily on ${summary.projectsWorkedOn.join(", ") || "ongoing projects"}. Notable areas include ${summary.featuresCompleted.length} features and ${summary.bugsFixed.length} bug fixes, with consistent use of ${summary.technologiesUsed.slice(0, 3).join(", ") || "the core stack"}. (Generated in development mode.)`
        : "",
  };
}
