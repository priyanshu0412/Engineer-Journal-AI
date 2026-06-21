import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

// Everything under /dashboard requires auth. Cron routes guard themselves
// via CRON_SECRET, so they're excluded here.
const isProtected = createRouteMatcher(["/dashboard(.*)"]);

const clerk = clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
});

// In mock mode, bypass Clerk entirely (no keys available).
export default MOCK_MODE
  ? function middleware(_req: NextRequest) {
      return NextResponse.next();
    }
  : clerk;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
