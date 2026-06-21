import "server-only";
import { connectDB } from "@/lib/mongodb/connect";
import { User } from "@/models/User";
import { JournalEntry } from "@/models/JournalEntry";
import { buildMonthlyReport, buildWeeklyReport } from "@/lib/reports/build";
import { buildMonthlyPDF, buildWeeklyPDF } from "@/lib/pdf/WeeklyReportPDF";
import { buildWorkbook } from "@/lib/excel/workbook";
import { serializeEntry } from "@/lib/serialize";
import { monthlyEmailHTML, weeklyEmailHTML, dailyReminderEmailHTML } from "@/lib/email/templates";
import { sendReportEmail, sendDailyReminderEmail } from "@/lib/email/send";
import { formatMonthLabel } from "@/lib/utils";

export interface CronResult {
  processed: number;
  sent: number;
  failed: number;
}

/** Generate the report for the week containing `ref` for every opted-in user. */
export async function runWeeklyForAllUsers(ref: Date = new Date()): Promise<CronResult> {
  await connectDB();
  const users = await User.find({ weeklyEmails: true }).lean();
  const result: CronResult = { processed: 0, sent: 0, failed: 0 };

  for (const u of users) {
    result.processed += 1;
    try {
      const tz = u.timezone || "Asia/Kolkata";
      const userLocalDate = new Date(ref.toLocaleString("en-US", { timeZone: tz }));
      const report = await buildWeeklyReport(u.clerkId, userLocalDate);
      if (report.rows.length === 0) continue; // nothing logged — skip
      
      const pdf = await buildWeeklyPDF(report);
      
      // Fetch entries for that week and generate Excel file
      const entries = await JournalEntry.find({
        userId: u.clerkId,
        date: { $gte: new Date(report.weekStart), $lte: new Date(report.weekEnd) },
      })
        .sort({ date: 1 })
        .lean();
      const excel = await buildWorkbook({
        year: report.isoYear,
        entries: entries.map(serializeEntry),
        weeklies: [report],
        monthlies: [],
      });

      const res = await sendReportEmail({
        userId: u.clerkId,
        to: u.email,
        type: "weekly",
        subject: `Your weekly report — Week ${report.isoWeek}, ${report.isoYear}`,
        html: weeklyEmailHTML(report),
        pdf,
        pdfFilename: `weekly-report-w${report.isoWeek}-${report.isoYear}.pdf`,
        excel,
        excelFilename: `weekly-report-w${report.isoWeek}-${report.isoYear}.xlsx`,
      });
      res.ok ? (result.sent += 1) : (result.failed += 1);
    } catch {
      result.failed += 1;
    }
  }
  return result;
}

/** Generate the report for the month containing `ref` for every opted-in user. */
export async function runMonthlyForAllUsers(ref: Date = new Date()): Promise<CronResult> {
  await connectDB();
  const users = await User.find({ monthlyEmails: true }).lean();
  const result: CronResult = { processed: 0, sent: 0, failed: 0 };

  for (const u of users) {
    result.processed += 1;
    try {
      const tz = u.timezone || "Asia/Kolkata";
      const userLocalDate = new Date(ref.toLocaleString("en-US", { timeZone: tz }));
      const report = await buildMonthlyReport(u.clerkId, userLocalDate);
      if (report.totalWorkingDays === 0) continue;
      
      const pdf = await buildMonthlyPDF(report);
      const label = formatMonthLabel(report.year, report.month);

      // Fetch entries for that month and generate Excel file
      const startOfMonth = new Date(report.year, report.month, 1, 0, 0, 0, 0);
      const endOfMonth = new Date(report.year, report.month + 1, 0, 23, 59, 59, 999);
      const entries = await JournalEntry.find({
        userId: u.clerkId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      })
        .sort({ date: 1 })
        .lean();
      const excel = await buildWorkbook({
        year: report.year,
        entries: entries.map(serializeEntry),
        weeklies: [],
        monthlies: [report],
      });

      const res = await sendReportEmail({
        userId: u.clerkId,
        to: u.email,
        type: "monthly",
        subject: `Your monthly report — ${label}`,
        html: monthlyEmailHTML(report),
        pdf,
        pdfFilename: `monthly-report-${report.year}-${String(report.month + 1).padStart(2, "0")}.pdf`,
        excel,
        excelFilename: `monthly-report-${report.year}-${String(report.month + 1).padStart(2, "0")}.xlsx`,
      });
      res.ok ? (result.sent += 1) : (result.failed += 1);
    } catch {
      result.failed += 1;
    }
  }
  return result;
}

/** Send a daily reminder asking user to log their entry if they haven't yet today. */
export async function runDailyReminderForAllUsers(ref: Date = new Date()): Promise<CronResult> {
  await connectDB();
  const users = await User.find({ dailyEmails: true }).lean();
  const result: CronResult = { processed: 0, sent: 0, failed: 0 };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${appUrl}/dashboard`;

  for (const u of users) {
    result.processed += 1;
    try {
      const tz = u.timezone || "Asia/Kolkata";
      // Get the local date string for the user's timezone: YYYY-MM-DD
      const userDateStr = ref.toLocaleDateString("en-CA", { timeZone: tz });
      const targetDate = new Date(userDateStr); // Midnight UTC of that local date

      // Check if entry already exists for this date
      const alreadyLogged = await JournalEntry.findOne({
        userId: u.clerkId,
        date: targetDate,
      });

      if (alreadyLogged) {
        // Already logged today's entry - skip email
        continue;
      }

      // Not logged yet - send email
      const html = dailyReminderEmailHTML(u.name || "", dashboardUrl);
      const res = await sendDailyReminderEmail({
        userId: u.clerkId,
        to: u.email,
        subject: "What did you do today?",
        html,
      });

      res.ok ? (result.sent += 1) : (result.failed += 1);
    } catch (err) {
      result.failed += 1;
    }
  }
  return result;
}
