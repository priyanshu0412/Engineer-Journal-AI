import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { MOCK_MODE } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevTrack AI — Developer Work Journal",
  description:
    "Log your daily engineering work in any language. AI turns it into professional reports, summaries, and analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const body = (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );

  // In mock mode there's no Clerk key, so skip the provider entirely.
  return MOCK_MODE ? body : <ClerkProvider>{body}</ClerkProvider>;
}
