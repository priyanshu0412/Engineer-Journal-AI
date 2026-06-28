"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updateSettings, type UserSettings } from "@/actions/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const hourStr = String(hour).padStart(2, "0");
  const minuteStr = String(minute).padStart(2, "0");
  const timeVal = `${hourStr}:${minuteStr}`;

  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayHourStr = String(displayHour).padStart(2, "0");
  const label = `${displayHourStr}:${minuteStr} ${ampm}`;

  return { value: timeVal, label };
});

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/10">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-muted-foreground/20 hover:bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}


export function SettingsForm({ initial }: { initial: UserSettings }) {
  const [weekly, setWeekly] = React.useState(initial.weeklyEmails);
  const [monthly, setMonthly] = React.useState(initial.monthlyEmails);
  const [daily, setDaily] = React.useState(initial.dailyEmails);
  const [dailyTime, setDailyTime] = React.useState(initial.dailyEmailTime);
  const [tz, setTz] = React.useState(initial.timezone);
  const [pending, start] = React.useTransition();

  function save() {
    start(async () => {
      try {
        await updateSettings({
          weeklyEmails: weekly,
          monthlyEmails: monthly,
          dailyEmails: daily,
          dailyEmailTime: dailyTime,
          timezone: tz,
        });
        toast.success("Settings saved.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Name</Label>
            <Input value={initial.name} readOnly className="bg-muted/40" />
          </div>
          <div className="grid gap-1.5">
            <Label>Email</Label>
            <Input value={initial.email} readOnly className="bg-muted/40" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle
            label="Weekly report email"
            description="Delivered automatically every Sunday at 10 AM IST."
            checked={weekly}
            onChange={setWeekly}
          />
          <Toggle
            label="Monthly report email"
            description="Delivered automatically at 10 AM IST on the last day of each month."
            checked={monthly}
            onChange={setMonthly}
          />
          <Toggle
            label="Daily work reminder email"
            description="Delivered daily if you haven't logged your work yet."
            checked={daily}
            onChange={setDaily}
          />
          {daily && (
            <div className="grid max-w-xs gap-1.5 pl-4 border-l-2 border-primary/20">
              <Label htmlFor="dailyTime">Preferred Notification Time</Label>
              <Select value={dailyTime} onValueChange={setDailyTime}>
                <SelectTrigger id="dailyTime" className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid max-w-xs gap-1.5">
            <Label htmlFor="tz">Timezone</Label>
            <Input
              id="tz"
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              placeholder="e.g. Asia/Kolkata"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Save changes
      </Button>
    </div>
  );
}
