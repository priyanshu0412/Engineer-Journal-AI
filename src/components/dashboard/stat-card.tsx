import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";


export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-primary/20 bg-card/70 backdrop-blur-sm">
      {/* Decorative hover glow */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent group-hover:from-primary group-hover:to-indigo-500 transition-all duration-300">
            {value}
          </p>
          {hint && <p className="text-[11px] text-muted-foreground font-medium">{hint}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10 shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

