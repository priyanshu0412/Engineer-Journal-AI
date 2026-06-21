import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ReportSummarySchema } from "./AIProcessed";

const MonthlyReportSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    month: { type: Number, required: true }, // 0-11
    year: { type: Number, required: true },
    totalWorkingDays: { type: Number, default: 0 },
    summary: { type: ReportSummarySchema, default: () => ({}) },
    aiPerformanceAnalysis: { type: String, default: "" },
  },
  { timestamps: true },
);

MonthlyReportSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export type MonthlyReportDoc = InferSchemaType<typeof MonthlyReportSchema>;

export const MonthlyReport: Model<MonthlyReportDoc> =
  (models.MonthlyReport as Model<MonthlyReportDoc>) ||
  model<MonthlyReportDoc>("MonthlyReport", MonthlyReportSchema);
