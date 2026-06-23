import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "./mongodb/connect";
import { User } from "@/models/User";
import { welcomeEmailHTML } from "@/lib/email/templates";
import { sendWelcomeEmail } from "@/lib/email/send";
import { DEV_USER_EMAIL, DEV_USER_ID, DEV_USER_NAME, MOCK_MODE } from "@/lib/config";

/** Returns the user id for the current request, or throws if signed out. */
export async function requireUserId(): Promise<string> {
  if (MOCK_MODE) return DEV_USER_ID;
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

/**
 * Ensure a User document exists. In mock mode this upserts the dev user and
 * seeds demo data; otherwise it syncs the signed-in Clerk user.
 */
export async function ensureUser() {
  await connectDB();

  if (MOCK_MODE) {
    const existing = await User.findOne({ clerkId: DEV_USER_ID });
    const isNew = !existing;
    const doc = await User.findOneAndUpdate(
      { clerkId: DEV_USER_ID },
      {
        $set: { email: DEV_USER_EMAIL, name: DEV_USER_NAME },
        $setOnInsert: { clerkId: DEV_USER_ID },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    if (isNew && doc) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const welcomeHtml = welcomeEmailHTML(doc.name || "", `${appUrl}/dashboard`);
      await sendWelcomeEmail({
        userId: doc.clerkId,
        to: doc.email,
        subject: "Welcome to DevTrack AI!",
        html: welcomeHtml,
      }).catch((err) => {
        console.error("Failed to send mock welcome email:", err);
      });
    }
    // Demo data is seeded inside connectDB() in mock mode.
    return doc;
  }

  const cu = await currentUser();
  if (!cu) return null;
  const email = cu.emailAddresses[0]?.emailAddress ?? "";
  const name = [cu.firstName, cu.lastName].filter(Boolean).join(" ");
  
  const existing = await User.findOne({ clerkId: cu.id });
  const isNew = !existing;

  const doc = await User.findOneAndUpdate(
    { clerkId: cu.id },
    { $set: { email, name }, $setOnInsert: { clerkId: cu.id } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  if (isNew && doc) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const welcomeHtml = welcomeEmailHTML(doc.name || "", `${appUrl}/dashboard`);
    await sendWelcomeEmail({
      userId: doc.clerkId,
      to: doc.email,
      subject: "Welcome to DevTrack AI!",
      html: welcomeHtml,
    }).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });
  }

  return doc;
}
