import { FolderGit, Compass, Bug, BookOpen, Trophy, AlertTriangle, Brain, Cpu, FileText } from "lucide-react";

interface SummaryListProps {
  title: string;
  items: string[];
}

function getTitleTheme(title: string) {
  const t = title.toLowerCase();
  if (t.includes("project")) {
    return { icon: FolderGit, color: "text-blue-500", border: "border-blue-500/10", bg: "bg-blue-500/[0.02] dark:bg-blue-500/[0.04]" };
  }
  if (t.includes("feature") || t.includes("deliver")) {
    return { icon: Compass, color: "text-purple-500", border: "border-purple-500/10", bg: "bg-purple-500/[0.02] dark:bg-purple-500/[0.04]" };
  }
  if (t.includes("bug")) {
    return { icon: Bug, color: "text-emerald-500", border: "border-emerald-500/10", bg: "bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]" };
  }
  if (t.includes("document")) {
    return { icon: BookOpen, color: "text-indigo-500", border: "border-indigo-500/10", bg: "bg-indigo-500/[0.02] dark:bg-indigo-500/[0.04]" };
  }
  if (t.includes("achievement")) {
    return { icon: Trophy, color: "text-amber-500", border: "border-amber-500/10", bg: "bg-amber-500/[0.02] dark:bg-amber-500/[0.04]" };
  }
  if (t.includes("challenge") || t.includes("face")) {
    return { icon: AlertTriangle, color: "text-rose-500", border: "border-rose-500/10", bg: "bg-rose-500/[0.02] dark:bg-rose-500/[0.04]" };
  }
  if (t.includes("learning")) {
    return { icon: Brain, color: "text-orange-500", border: "border-orange-500/10", bg: "bg-orange-500/[0.02] dark:bg-orange-500/[0.04]" };
  }
  if (t.includes("tech") || t.includes("use")) {
    return { icon: Cpu, color: "text-cyan-500", border: "border-cyan-500/10", bg: "bg-cyan-500/[0.02] dark:bg-cyan-500/[0.04]" };
  }
  return { icon: FileText, color: "text-muted-foreground", border: "border-muted-foreground/10", bg: "bg-muted/[0.01]" };
}

export function SummaryList({ title, items }: SummaryListProps) {
  if (!items.length) return null;
  const theme = getTitleTheme(title);
  const Icon = theme.icon;

  return (
    <div className={`p-4 rounded-xl border border-muted-foreground/10 ${theme.bg} transition-all duration-300 hover:scale-[1.01] hover:shadow-sm`}>
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className={`p-1.5 rounded-lg bg-background border ${theme.border} ${theme.color} shadow-sm`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-foreground">{title}</p>
      </div>
      <ul className="space-y-2 text-xs text-muted-foreground leading-normal pl-0.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className={`${theme.color} font-extrabold select-none mt-0.5`}>•</span>
            <span className="text-foreground/90 font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

