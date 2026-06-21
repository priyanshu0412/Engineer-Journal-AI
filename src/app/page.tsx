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

const features = [
  { icon: Languages, title: "Any language", desc: "Write in English, Hindi, Gujarati, Hinglish, or a mix. AI understands it all." },
  { icon: Sparkles, title: "Professional rewrite", desc: "Casual notes become clean, appraisal-ready English automatically." },
  { icon: CalendarDays, title: "Weekly & monthly reports", desc: "Entries combine into manager-friendly reports with summaries." },
  { icon: FileSpreadsheet, title: "Export anywhere", desc: "PDF, Excel, CSV, and Markdown — ready to share or attach." },
  { icon: BarChart3, title: "Analytics", desc: "Track projects, technologies, learnings, and challenge trends." },
  { icon: Mail, title: "Automated emails", desc: "Reports delivered to your inbox every Friday and month-end." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container flex items-center justify-between py-5">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          DevTrack AI
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <LandingAuthButtons />
        </div>
      </header>

      <main className="container">
        <section className="mx-auto max-w-3xl py-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Powered by Claude
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Log your work however you talk.
            <br />
            <span className="text-primary">Get reports that impress.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            DevTrack AI is a developer work journal. Jot down what you did in any language — the AI
            translates, rewrites it professionally, extracts your tasks and learnings, and builds
            weekly and monthly reports for you.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Start journaling <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-3xl pb-16">
          <Card className="overflow-hidden">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  You write
                </div>
                <p className="rounded-lg bg-muted p-4 text-sm leading-relaxed">
                  “Aaje login nu bug fix karyu. JWT refresh token ma issue hato. Documentation pan
                  update kari.”
                </p>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  AI produces
                </div>
                <p className="rounded-lg border bg-card p-4 text-sm leading-relaxed">
                  Fixed a login authentication bug caused by an issue in the JWT refresh-token flow,
                  and updated the related documentation.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardContent className="p-6">
                <f.icon className="mb-3 h-6 w-6 text-primary" />
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        DevTrack AI — a premium productivity tool for software engineers.
      </footer>
    </div>
  );
}
