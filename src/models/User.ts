import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String, default: "" },
    // Notification preferences for automated reports.
    weeklyEmails: { type: Boolean, default: true },
    monthlyEmails: { type: Boolean, default: true },
    dailyEmails: { type: Boolean, default: true },
    timezone: { type: String, default: "Asia/Kolkata" },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
