import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ReportSummarySchema } from "./AIProcessed";

const WeeklyRowSchema = new Schema(
  {
    date: { type: Date, required: true },
    day: { type: String, required: true },
    project: { type: String, default: "" },
    tasksCompleted: { type: [String], default: [] },
    challenges: { type: [String], default: [] },
    learnings: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
  },
  { _id: false },
);

const WeeklyReportSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    isoWeek: { type: Number, required: true },
    isoYear: { type: Number, required: true },
    rows: { type: [WeeklyRowSchema], default: [] },
    summary: { type: ReportSummarySchema, default: () => ({}) },
  },
  { timestamps: true },
);

// One report per user per ISO week.
WeeklyReportSchema.index({ userId: 1, isoYear: 1, isoWeek: 1 }, { unique: true });

export type WeeklyReportDoc = InferSchemaType<typeof WeeklyReportSchema>;

export const WeeklyReport: Model<WeeklyReportDoc> =
  (models.WeeklyReport as Model<WeeklyReportDoc>) ||
  model<WeeklyReportDoc>("WeeklyReport", WeeklyReportSchema);
