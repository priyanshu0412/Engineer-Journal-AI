"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Terminal, CheckCircle2, Brain, Tag, Code, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoScenario {
  label: string;
  raw: string;
  summary: string;
  tasks: string[];
  learnings: string[];
  category: string;
  tech: string[];
}

const SCENARIOS: DemoScenario[] = [
  {
    label: "Hinglish Casual",
    raw: "Aaje login nu bug fix karyu. JWT refresh token ma issue hato. Documentation pan update kari.",
    summary: "Resolved a login authentication bug caused by a JWT refresh token issue, and updated the related developer documentation.",
    tasks: [
      "Fix login authentication vulnerability",
      "Debug and resolve JWT refresh token lifecycle bug",
      "Update system authentication flow documentation"
    ],
    learnings: [
      "Discovered edge cases in token expiration timing during inactive tabs"
    ],
    category: "Auth & Documentation",
    tech: ["JWT", "Auth", "Next.js"]
  },
  {
    label: "Messy Bullets",
    raw: "db connection timeout solved (pooled connections), updated PM about dashboard charts progress, wrote schema test for mongo",
    summary: "Resolved database connection timeout errors by implementing connection pooling. Authored MongoDB schema validation tests and shared dashboard analytics progress with the PM.",
    tasks: [
      "Implement connection pooling for MongoDB cluster",
      "Wrote schema verification and integration tests",
      "Update Product Manager on analytics dashboard milestones"
    ],
    learnings: [
      "Connection pool exhaustion was occurring due to unclosed client instances in serverless functions"
    ],
    category: "Database & Backend",
    tech: ["MongoDB", "Testing", "Analytics"]
  },
  {
    label: "Hinglish Mix",
    raw: "Sidebar fix kiya responsive issue me, border layout gap change kiya, dark mode header issues check details next time",
    summary: "Resolved responsive display bugs in the navigation sidebar, adjusted layout spacing parameters, and conducted a dark mode CSS variable audit on the header component.",
    tasks: [
      "Fix responsiveness issues on navigation sidebar",
      "Optimize layout padding and border spacing",
      "Audit dark-mode colors inside header elements"
    ],
    learnings: [
      "CSS borders using arbitrary values were breaking responsive breakpoints. Replaced with Tailwind layout utilities."
    ],
    category: "Frontend & UI",
    tech: ["TailwindCSS", "React", "UX/UI"]
  }
];

export function InteractiveDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [status, setStatus] = useState<"idle" | "typing" | "processing" | "done">("idle");
  const [displayedRaw, setDisplayedRaw] = useState("");
  const [displayedSummary, setDisplayedSummary] = useState("");
  const [stepMsg, setStepMsg] = useState("");
  const [visibleTasks, setVisibleTasks] = useState<number>(0);
  
  const currentScenario = SCENARIOS[activeIdx];
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Restart demonstration sequence
  const startDemo = (index: number) => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setActiveIdx(index);
    setStatus("typing");
    setDisplayedRaw("");
    setDisplayedSummary("");
    setStepMsg("Typing journal note...");
    setVisibleTasks(0);
  };

  // Run initial demo on mount
  useEffect(() => {
    startDemo(0);
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  // Handle simulated raw input typing
  useEffect(() => {
    if (status !== "typing") return;

    const fullText = SCENARIOS[activeIdx].raw;
    if (displayedRaw.length < fullText.length) {
      const nextChar = fullText[displayedRaw.length];
      const delay = nextChar === " " ? 40 : 25;
      typingTimerRef.current = setTimeout(() => {
        setDisplayedRaw((prev) => prev + nextChar);
      }, delay);
    } else {
      // Typing done, start processing after short delay
      typingTimerRef.current = setTimeout(() => {
        setStatus("processing");
      }, 700);
    }
  }, [displayedRaw, status, activeIdx]);

  // Handle simulated AI processing messages
  useEffect(() => {
    if (status !== "processing") return;

    const steps = [
      { text: "Detecting Hinglish/Casual structure...", delay: 0 },
      { text: "Translating to professional terminology...", delay: 800 },
      { text: "Extracting tasks, tech tags, and learnings...", delay: 1700 },
    ];

    const timeouts = steps.map((step) => {
      return setTimeout(() => {
        setStepMsg(step.text);
      }, step.delay);
    });

    const completionTimeout = setTimeout(() => {
      setStatus("done");
      setStepMsg("");
    }, 2600);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(completionTimeout);
    };
  }, [status]);

  // Handle typing output summary and sliding tasks in
  useEffect(() => {
    if (status !== "done") return;

    const fullSummary = currentScenario.summary;
    if (displayedSummary.length < fullSummary.length) {
      typingTimerRef.current = setTimeout(() => {
        setDisplayedSummary(fullSummary.slice(0, displayedSummary.length + 2));
      }, 10);
    } else {
      // After summary is typed out, show tasks one by one
      if (visibleTasks < currentScenario.tasks.length) {
        typingTimerRef.current = setTimeout(() => {
          setVisibleTasks((prev) => prev + 1);
        }, 300);
      }
    }
  }, [displayedSummary, status, visibleTasks, activeIdx, currentScenario]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      {/* Tab controls */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {SCENARIOS.map((scenario, idx) => (
          <button
            key={scenario.label}
            onClick={() => startDemo(idx)}
            disabled={status === "typing" || status === "processing"}
            className={cn(
              "relative px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 border focus:outline-none",
              activeIdx === idx
                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground",
              (status === "typing" || status === "processing") && "opacity-60 cursor-not-allowed"
            )}
          >
            {scenario.label}
          </button>
        ))}
        
        <button
          onClick={() => startDemo(activeIdx)}
          disabled={status === "typing" || status === "processing"}
          className="ml-2 p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-300"
          title="Restart animation"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", (status === "typing" || status === "processing") && "animate-spin")} />
        </button>
      </div>

      {/* Editor Mockup Wrapper */}
      <div className="relative rounded-2xl border border-muted-foreground/10 bg-card/65 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-primary/5 hover:border-primary/20">
        
        {/* Mock OS Header bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-muted-foreground/5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-[10px] tracking-widest uppercase">terminal_journal.log</span>
          </div>
          <div className="flex items-center gap-1 bg-background/50 px-2 py-0.5 rounded-md border text-[10px] font-mono">
            <Terminal className="w-3.5 h-3.5 text-primary animate-pulse" />
            LIVE TRANSFORMATION DEMO
          </div>
        </div>

        {/* Layout container */}
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-muted-foreground/5 min-h-[360px]">
          
          {/* LEFT: You Write Panel */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">1</span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What you write</span>
              </div>
              <div className="font-mono text-sm leading-relaxed p-4 rounded-xl bg-muted/30 border border-muted-foreground/5 text-foreground min-h-[140px] relative">
                {displayedRaw}
                {status === "typing" && (
                  <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />
                )}
                {displayedRaw === "" && (
                  <span className="text-muted-foreground/45 italic">Waiting for draft...</span>
                )}
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500/60" />
              Casual thoughts, Hinglish, or mixed languages. Write freely.
            </div>
          </div>

          {/* RIGHT: AI Transform Panel */}
          <div className="p-6 flex flex-col justify-between bg-primary/[0.01] relative overflow-hidden">
            {/* Soft decorative glow */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none opacity-40" />

            <div className="space-y-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">2</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    AI refinement
                  </span>
                </div>
                
                {status === "done" && currentScenario.category && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 animate-fade-in">
                    <Tag className="w-2.5 h-2.5" />
                    {currentScenario.category}
                  </span>
                )}
              </div>

              {/* Transition animations container */}
              <div className="min-h-[180px] space-y-4">
                {/* 1. Processing animation */}
                {status === "processing" && (
                  <div className="flex flex-col items-center justify-center h-40 space-y-3">
                    <Sparkles className="w-8 h-8 text-primary animate-spin" style={{ animationDuration: "3s" }} />
                    <p className="text-xs text-primary font-medium animate-pulse">{stepMsg}</p>
                  </div>
                )}

                {/* 2. Idle state */}
                {status === "idle" && (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-xs space-y-2">
                    <Sparkles className="w-6 h-6 text-muted-foreground/45" />
                    <p>Select a scenario to witness the magic</p>
                  </div>
                )}

                {/* 3. Output display */}
                {status === "done" && (
                  <div className="space-y-4">
                    {/* Professional Summary */}
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Professional Summary</h4>
                      <p className="text-sm leading-relaxed font-medium">
                        {displayedSummary}
                        {displayedSummary.length < currentScenario.summary.length && (
                          <span className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 animate-pulse" />
                        )}
                      </p>
                    </div>

                    {/* Extracted Tasks */}
                    {visibleTasks > 0 && (
                      <div className="space-y-2 pt-2 border-t border-muted-foreground/5 transition-all duration-300">
                        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Extracted Tasks
                        </h4>
                        <ul className="space-y-1 text-xs">
                          {currentScenario.tasks.slice(0, visibleTasks).map((task, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-muted-foreground animate-slide-up">
                              <span className="text-emerald-500 font-bold mt-0.5">•</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Extracted Learnings */}
                    {visibleTasks === currentScenario.tasks.length && (
                      <div className="space-y-1 pt-2 border-t border-muted-foreground/5 animate-slide-up">
                        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5 text-amber-500" /> Key Learnings
                        </h4>
                        <p className="text-xs text-muted-foreground italic leading-normal pl-4.5">
                          "{currentScenario.learnings[0]}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tech tag footer */}
            <div className="mt-4 pt-3 border-t border-muted-foreground/5 z-10 flex flex-wrap items-center justify-between gap-2 min-h-[28px]">
              {status === "done" ? (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <Code className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                  {currentScenario.tech.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground border border-muted-foreground/5 hover:text-foreground transition-all duration-200">
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground italic">
                  AI will extract tags, categories, & tech metadata.
                </div>
              )}
              {status === "done" && (
                <div className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Refined!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating animations helper styles (inlined or class-based logic handles transitions) */}
      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
