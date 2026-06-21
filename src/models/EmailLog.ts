import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const EmailLogSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    to: { type: String, required: true },
    type: { type: String, enum: ["weekly", "monthly", "daily"], required: true },
    subject: { type: String, default: "" },
    status: { type: String, enum: ["sent", "failed"], required: true },
    providerId: { type: String, default: "" },
    error: { type: String, default: "" },
  },
  { timestamps: true },
);

export type EmailLogDoc = InferSchemaType<typeof EmailLogSchema>;

export const EmailLog: Model<EmailLogDoc> =
  (models.EmailLog as Model<EmailLogDoc>) ||
  model<EmailLogDoc>("EmailLog", EmailLogSchema);
