import { formatReportDate } from "@/lib/utils";
import type { MonthlyReportDTO, WeeklyReportDTO } from "@/types";

const shell = (title: string, body: string) => `
<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
  <div style="max-width:640px;margin:0 auto;padding:24px">
    <div style="background:#1e293b;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
      <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.7">DevTrack AI</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px">${title}</div>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
      ${body}
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">
      Sent automatically by DevTrack AI · The full report is attached as a PDF.
    </p>
  </div>
</body></html>`;

const bullets = (title: string, items: string[]) =>
  items.length
    ? `<h3 style="font-size:14px;margin:16px 0 6px">${title}</h3><ul style="margin:0;padding-left:18px;line-height:1.6">${items
        .map((i) => `<li>${i}</li>`)
        .join("")}</ul>`
    : "";

export function weeklyEmailHTML(wr: WeeklyReportDTO): string {
  const body = `
    <p style="color:#64748b;margin-top:0">Week ${wr.isoWeek}, ${wr.isoYear} · ${formatReportDate(
      wr.weekStart,
    )} – ${formatReportDate(wr.weekEnd)}</p>
    ${wr.summary.narrative ? `<p style="line-height:1.6">${wr.summary.narrative}</p>` : ""}
    ${bullets("Major Achievements", wr.summary.majorAchievements)}
    ${bullets("Features Completed", wr.summary.featuresCompleted)}
    ${bullets("Bugs Fixed", wr.summary.bugsFixed)}
    ${bullets("Technologies Used", wr.summary.technologiesUsed)}
  `;
  return shell("Your Weekly Work Report", body);
}

export function monthlyEmailHTML(mr: MonthlyReportDTO): string {
  const label = new Date(mr.year, mr.month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const body = `
    <p style="color:#64748b;margin-top:0">${label} · ${mr.totalWorkingDays} working days logged</p>
    ${mr.aiPerformanceAnalysis ? `<p style="line-height:1.6">${mr.aiPerformanceAnalysis}</p>` : ""}
    ${bullets("Major Achievements", mr.summary.majorAchievements)}
    ${bullets("Features Delivered", mr.summary.featuresCompleted)}
    ${bullets("Top Technologies", mr.summary.technologiesUsed)}
  `;
  return shell("Your Monthly Work Report", body);
}

export function dailyReminderEmailHTML(name: string, dashboardUrl: string): string {
  const body = `
    <p style="font-size:16px;line-height:1.6;margin-top:0">Hi ${name || "there"},</p>
    <p style="font-size:16px;line-height:1.6">It's 7:00 PM! Don't forget to log your daily engineering work today.</p>
    <p style="font-size:15px;line-height:1.6;color:#64748b">Keep your streak alive and make generating your weekly/monthly reports effortless.</p>
    <div style="margin:24px 0">
      <a href="${dashboardUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">Log Today's Work</a>
    </div>
  `;
  return shell("What did you do today?", body);
}

export function welcomeEmailHTML(name: string, dashboardUrl: string): string {
  const body = `
    <p style="font-size:16px;line-height:1.6;margin-top:0">Hi ${name || "there"},</p>
    <p style="font-size:16px;line-height:1.6">Welcome to <strong>DevTrack AI</strong>! We're excited to help you track and showcase your daily engineering work.</p>
    <p style="font-size:15px;line-height:1.6;color:#64748b">Here is a quick overview of how DevTrack AI works:</p>
    <ul style="line-height:1.8;padding-left:20px;font-size:15px;color:#334155">
      <li><strong>Log Daily</strong>: Write naturally in any language (English, Hindi, Hinglish, Gujarati, etc.). The AI automatically structures it, extracting tasks, achievements, challenges, and technologies.</li>
      <li><strong>Daily Reminders</strong>: We'll send you a brief prompt at 7:00 PM IST if you haven't logged your work yet.</li>
      <li><strong>Automated Reports</strong>: Get professional summaries emailed to you every Sunday at 10:00 AM IST and on the last day of the month.</li>
    </ul>
    <div style="margin:24px 0">
      <a href="${dashboardUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">Go to Dashboard</a>
    </div>
    <p style="font-size:14px;line-height:1.6;color:#94a3b8">If you have any feedback or ideas, feel free to reply directly. Happy tracking!</p>
  `;
  return shell("Welcome to DevTrack AI!", body);
}
