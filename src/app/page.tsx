import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  FileSpreadsheet,
  Languages,
  Mail,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { LandingAuthButtons } from "@/components/auth/auth-controls";
import { InteractiveDemo } from "@/components/landing/interactive-demo";

const features = [
  {
    icon: Languages,
    title: "Any language",
    desc: "Write in English, Hindi, Gujarati, Hinglish, or a mix. The AI understands natural engineering context automatically.",
  },
  {
    icon: Sparkles,
    title: "Professional rewrite",
    desc: "Casual shorthand, messy bullets, and raw logs become clean, appraisal-ready English summaries instantly.",
  },
  {
    icon: CalendarDays,
    title: "Weekly & monthly reports",
    desc: "Your processed journal entries combine into structured, manager-friendly reports complete with key metrics.",
  },
  {
    icon: FileSpreadsheet,
    title: "Export anywhere",
    desc: "PDF, Excel, CSV, and Markdown — ready to attach to Jiras, email to managers, or share in Slack/Teams.",
  },
  {
    icon: BarChart3,
    title: "Analytics & insights",
    desc: "Track active projects, core technologies, personal learnings, and challenge trends over time.",
  },
  {
    icon: Mail,
    title: "Automated emails",
    desc: "Reports delivered directly to your inbox every Friday afternoon and month-end without manual exports.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Visual background layers */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 dark:opacity-[0.18] pointer-events-none" />
      <div className="absolute inset-0 bg-dot-pattern opacity-20 dark:opacity-[0.12] pointer-events-none" />
      
      {/* Aurora glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial-glow pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-radial-glow-secondary pointer-events-none" />
      
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[22%] left-[8%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute top-[45%] right-[10%] w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: "3.5s" }} />

      <header className="sticky top-0 z-50 w-full border-b border-muted-foreground/10 bg-background/60 backdrop-blur-md transition-all duration-300">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:scale-[1.02] transition-transform duration-250 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              DevTrack AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <LandingAuthButtons />
          </div>
        </div>
      </header>

      <main className="container relative z-10">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl pt-20 pb-12 text-center flex flex-col items-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary dark:bg-primary/10 shadow-sm animate-float-delayed">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Smart AI-Powered Developer Journal
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-tight">
            Log your work however you talk.
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 drop-shadow-sm">
              Get reports that impress.
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            DevTrack AI is a premium developer work journal. Jot down what you did in any language — Hinglish, Hindi, or bullet notes. The AI automatically translates, rewrites professionally, and compiles ready-for-appraisal weekly and monthly reports.
          </p>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/45 hover:scale-[1.03] transition-all duration-300 px-8 py-6 text-sm font-semibold active:scale-95 group">
              <Link href="/dashboard">
                Start journaling <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-250 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Live Transformation Demo Section */}
        <section className="mx-auto max-w-5xl py-8 animate-float">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Watch the transformation live</h2>
            <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
              Select one of the developer drafts below to see the intelligent AI rewrite and analyze it instantly.
            </p>
          </div>
          <InteractiveDemo />
        </section>

        {/* Features Grid */}
        <section className="grid gap-6 pt-12 pb-28 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const IconComponent = f.icon;
            return (
              <Card
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-muted-foreground/10 bg-card/45 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-primary/30 hover:bg-card/75"
              >
                <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div>
                    {/* Icon container */}
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary/20">
                      <IconComponent className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <h3 className="font-bold text-lg tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                  {/* Subtle bottom indicator */}
                  <div className="h-1 w-0 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-300 group-hover:w-16" />
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-muted-foreground/10 py-12 text-center text-sm text-muted-foreground bg-muted/20 relative z-10">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            <span className="text-foreground tracking-wide">DevTrack AI</span>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} DevTrack AI — A premium productivity companion for software engineers.</p>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <span className="text-muted-foreground/30">|</span>
            <span className="text-muted-foreground/60 select-none">AI-Powered</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

