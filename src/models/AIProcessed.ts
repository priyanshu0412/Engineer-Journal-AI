import { Schema } from "mongoose";

/** Embedded sub-document shared by entries — the structured AI output. */
export const AIProcessedSchema = new Schema(
  {
    detectedLanguages: { type: [String], default: [] },
    professionalSummary: { type: String, default: "" },
    tasks: { type: [String], default: [] },
    keyAchievements: { type: [String], default: [] },
    learnings: { type: [String], default: [] },
    challenges: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
  },
  { _id: false },
);

/** Embedded sub-document shared by reports — the aggregated summary. */
export const ReportSummarySchema = new Schema(
  {
    projectsWorkedOn: { type: [String], default: [] },
    featuresCompleted: { type: [String], default: [] },
    bugsFixed: { type: [String], default: [] },
    documentationUpdates: { type: [String], default: [] },
    majorAchievements: { type: [String], default: [] },
    challengesFaced: { type: [String], default: [] },
    learnings: { type: [String], default: [] },
    technologiesUsed: { type: [String], default: [] },
    narrative: { type: String, default: "" },
  },
  { _id: false },
);
