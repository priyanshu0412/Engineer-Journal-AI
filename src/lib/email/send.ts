import "server-only";
import { Resend } from "resend";
import { connectDB } from "@/lib/mongodb/connect";
import { EmailLog } from "@/models/EmailLog";
import { useMockEmail } from "@/lib/config";

let _resend: Resend | null = null;
function resend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set. Add it to .env.local.");
  }
  _resend ??= new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export interface SendReportArgs {
  userId: string;
  to: string;
  type: "weekly" | "monthly";
  subject: string;
  html: string;
  pdf: Buffer;
  pdfFilename: string;
  excel: Buffer;
  excelFilename: string;
}

/** Send a report email with PDF and Excel attachments, and record the attempt in EmailLogs. */
export async function sendReportEmail(args: SendReportArgs): Promise<{ ok: boolean }> {
  await connectDB();

  // Development mode: don't hit Resend — log to the console and record the log.
  if (useMockEmail()) {
    // eslint-disable-next-line no-console
    console.log(
      `[mock email] ${args.type} report → ${args.to} · "${args.subject}" · ${args.pdfFilename} (${args.pdf.length} bytes) & ${args.excelFilename} (${args.excel.length} bytes)`,
    );
    await EmailLog.create({
      userId: args.userId,
      to: args.to,
      type: args.type,
      subject: args.subject,
      status: "sent",
      providerId: "mock",
    });
    return { ok: true };
  }

  const from = process.env.RESEND_FROM_EMAIL || "DevTrack AI <onboarding@resend.dev>";
  try {
    const { data, error } = await resend().emails.send({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      attachments: [
        { filename: args.pdfFilename, content: args.pdf },
        { filename: args.excelFilename, content: args.excel },
      ],
    });
    if (error) throw new Error(error.message);
    await EmailLog.create({
      userId: args.userId,
      to: args.to,
      type: args.type,
      subject: args.subject,
      status: "sent",
      providerId: data?.id ?? "",
    });
    return { ok: true };
  } catch (err) {
    await EmailLog.create({
      userId: args.userId,
      to: args.to,
      type: args.type,
      subject: args.subject,
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false };
  }
}

export interface SendDailyReminderArgs {
  userId: string;
  to: string;
  subject: string;
  html: string;
}

/** Send a daily reminder email without attachments, and record the attempt in EmailLogs. */
export async function sendDailyReminderEmail(args: SendDailyReminderArgs): Promise<{ ok: boolean }> {
  await connectDB();

  if (useMockEmail()) {
    // eslint-disable-next-line no-console
    console.log(`[mock email] daily reminder → ${args.to} · "${args.subject}"`);
    await EmailLog.create({
      userId: args.userId,
      to: args.to,
      type: "daily",
      subject: args.subject,
      status: "sent",
      providerId: "mock",
    });
    return { ok: true };
  }

  const from = process.env.RESEND_FROM_EMAIL || "DevTrack AI <onboarding@resend.dev>";
  try {
    const { data, error } = await resend().emails.send({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
    });
    if (error) throw new Error(error.message);
    await EmailLog.create({
      userId: args.userId,
      to: args.to,
      type: "daily",
      subject: args.subject,
      status: "sent",
      providerId: data?.id ?? "",
    });
    return { ok: true };
  } catch (err) {
    await EmailLog.create({
      userId: args.userId,
      to: args.to,
      type: "daily",
      subject: args.subject,
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false };
  }
}
