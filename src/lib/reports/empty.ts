import "server-only";
import type { ReportSummary } from "@/types";

export function emptySummary(): ReportSummary {
  return {
    projectsWorkedOn: [],
    featuresCompleted: [],
    bugsFixed: [],
    documentationUpdates: [],
    majorAchievements: [],
    challengesFaced: [],
    learnings: [],
    technologiesUsed: [],
    narrative: "",
  };
}
