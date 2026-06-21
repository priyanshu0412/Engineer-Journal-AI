"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MOCK_MODE } from "@/lib/config";

/** Header auth buttons on the landing page. */
export function LandingAuthButtons() {
  if (MOCK_MODE) {
    return (
      <Button asChild>
        <Link href="/dashboard">
          Open dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }
  return (
    <>
      <SignedOut>
        <Button asChild variant="ghost">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Get started</Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <Button asChild>
          <Link href="/dashboard">
            Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </SignedIn>
    </>
  );
}

/** User control in the dashboard top bar. */
export function TopbarUser() {
  if (MOCK_MODE) {
    return (
      <div className="flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          DU
        </span>
        Dev User
      </div>
    );
  }
  return <UserButton afterSignOutUrl="/" />;
}
