"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateMonthly, generateWeekly } from "@/actions/reports";

interface GenerateButtonProps {
  type: "weekly" | "monthly";
}

function GenerateReportButton({ type }: GenerateButtonProps) {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  const isWeekly = type === "weekly";
  const action = isWeekly ? generateWeekly : generateMonthly;
  const label = isWeekly ? "Generate this week" : "Generate this month";
  const successMsg = isWeekly
    ? "Weekly report generated for the current week."
    : "Monthly report generated for the current month.";

  return (
    <Button
      onClick={() =>
        start(async () => {
          try {
            await action();
            toast.success(successMsg);
            router.refresh();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to generate.");
          }
        })
      }
      disabled={pending}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      {label}
    </Button>
  );
}

export function GenerateWeeklyButton() {
  return <GenerateReportButton type="weekly" />;
}

export function GenerateMonthlyButton() {
  return <GenerateReportButton type="monthly" />;
}
