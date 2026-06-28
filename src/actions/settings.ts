"use server";

import { requireUserId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb/connect";
import { User } from "@/models/User";

export interface UserSettings {
  email: string;
  name: string;
  weeklyEmails: boolean;
  monthlyEmails: boolean;
  dailyEmails: boolean;
  dailyEmailTime: string;
  timezone: string;
}

export async function getSettings(): Promise<UserSettings> {
  const clerkId = await requireUserId();
  await connectDB();
  const doc = await User.findOne({ clerkId }).lean();
  return {
    email: doc?.email ?? "",
    name: doc?.name ?? "",
    weeklyEmails: doc?.weeklyEmails ?? true,
    monthlyEmails: doc?.monthlyEmails ?? true,
    dailyEmails: doc?.dailyEmails ?? true,
    dailyEmailTime: doc?.dailyEmailTime ?? "19:00",
    timezone: doc?.timezone ?? "Asia/Kolkata",
  };
}

export async function updateSettings(
  input: Pick<UserSettings, "weeklyEmails" | "monthlyEmails" | "dailyEmails" | "dailyEmailTime" | "timezone">,
): Promise<{ ok: true }> {
  const clerkId = await requireUserId();
  await connectDB();
  await User.updateOne(
    { clerkId },
    {
      $set: {
        weeklyEmails: input.weeklyEmails,
        monthlyEmails: input.monthlyEmails,
        dailyEmails: input.dailyEmails,
        dailyEmailTime: input.dailyEmailTime || "19:00",
        timezone: input.timezone || "Asia/Kolkata",
      },
    },
  );
  return { ok: true };
}
