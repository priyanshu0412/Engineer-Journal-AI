"use client";

import * as React from "react";
import { Check, Loader2, User, Mail, Globe, Lock, Clock, Calendar, Bell, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

// Parse 24-hour "HH:MM" into 12-hour values
function parse24to12(time24: string) {
  const [hStr, mStr] = (time24 || "19:00").split(":");
  const h24 = parseInt(hStr, 10);
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return {
    hour: String(h12),
    minute: mStr || "00",
    period,
  };
}

// Format 12-hour values back to 24-hour "HH:MM"
function format12to24(hour12: string, minute: string, period: string) {
  let h24 = parseInt(hour12, 10);
  if (period === "PM" && h24 !== 12) {
    h24 += 12;
  } else if (period === "AM" && h24 === 12) {
    h24 = 0;
  }
  const hStr = String(h24).padStart(2, "0");
  return `${hStr}:${minute}`;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-sm hover:bg-muted/5">
      <div className="flex gap-3">
        {Icon && (
          <div className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            checked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="space-y-0.5">
          <p className="text-sm font-medium leading-none">{label}</p>
          <p className="text-xs text-muted-foreground leading-normal">{description}</p>
        </div>
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

  // Split dailyEmailTime for 12-hour dropdown states
  const timeParts = parse24to12(initial.dailyEmailTime);
  const [hour12, setHour12] = React.useState(timeParts.hour);
  const [minute, setMinute] = React.useState(timeParts.minute);
  const [period, setPeriod] = React.useState(timeParts.period);

  const [pending, start] = React.useTransition();

  function save() {
    start(async () => {
      try {
        const dailyTime24 = format12to24(hour12, minute, period);
        await updateSettings({
          weeklyEmails: weekly,
          monthlyEmails: monthly,
          dailyEmails: daily,
          dailyEmailTime: dailyTime24,
          timezone: "Asia/Kolkata", // Hard-locked timezone
        });
        toast.success("Settings saved successfully.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save settings.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Account Profile Card */}
      <Card className="overflow-hidden border-muted-foreground/10 shadow-sm">
        <CardHeader className="bg-muted/10 pb-4 border-b border-muted-foreground/5">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-primary" /> Account details
          </CardTitle>
          <CardDescription>Your profile information imported from authentication provider.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 pt-5 sm:grid-cols-2">
          <div className="grid gap-1.5 relative">
            <Label className="text-xs font-semibold text-muted-foreground">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
              <Input value={initial.name} readOnly className="pl-9 bg-muted/20 border-muted-foreground/10 text-muted-foreground cursor-not-allowed select-none" />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
          </div>
          <div className="grid gap-1.5 relative">
            <Label className="text-xs font-semibold text-muted-foreground">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
              <Input value={initial.email} readOnly className="pl-9 bg-muted/20 border-muted-foreground/10 text-muted-foreground cursor-not-allowed select-none" />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Region / Timezone Settings Card */}
      <Card className="overflow-hidden border-muted-foreground/10 shadow-sm">
        <CardHeader className="bg-muted/10 pb-4 border-b border-muted-foreground/5">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Globe className="h-4.5 w-4.5 text-primary" /> Regional settings
          </CardTitle>
          <CardDescription>Region and timezone configurations for automated emails.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-muted/10 p-4 border-muted-foreground/10">
            <div className="flex gap-3 items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none mb-1">Timezone</p>
                <p className="text-xs text-muted-foreground">Asia/Kolkata (Indian Standard Time)</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Lock className="h-3 w-3" /> Locked to India
            </div>
          </div>

          <div className="flex gap-2.5 items-start bg-amber-500/5 text-amber-500 rounded-xl p-4 border border-amber-500/10 text-xs">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong>Region Restriction:</strong> Currently, daily reminders and report schedulers are restricted to India Standard Time (IST) for optimal server performance. International timezones support is coming in a future update.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences Card */}
      <Card className="overflow-hidden border-muted-foreground/10 shadow-sm">
        <CardHeader className="bg-muted/10 pb-4 border-b border-muted-foreground/5">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-primary" /> Email notifications
          </CardTitle>
          <CardDescription>Choose how and when you receive summaries of your journal logs.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <Toggle
            label="Weekly report email"
            description="Delivered automatically every Sunday at 10:00 AM IST."
            checked={weekly}
            onChange={setWeekly}
            icon={Calendar}
          />
          <Toggle
            label="Monthly report email"
            description="Delivered automatically at 10:00 AM IST on the last day of each month."
            checked={monthly}
            onChange={setMonthly}
            icon={Calendar}
          />
          <Toggle
            label="Daily work reminder email"
            description="Delivered daily if you haven't logged today's work yet."
            checked={daily}
            onChange={setDaily}
            icon={Clock}
          />

          {daily && (
            <div className="grid gap-2 pl-4 ml-4.5 border-l-2 border-primary/20 max-w-sm pt-2 pb-2">
              <Label htmlFor="dailyTime" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-primary" /> PREFERRED TIME (15-MIN INTERVALS)
              </Label>
              <div className="flex items-center gap-2">
                {/* Hour */}
                <div className="w-[85px]">
                  <Select value={hour12} onValueChange={setHour12}>
                    <SelectTrigger id="dailyTime" className="bg-background border-muted-foreground/15 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                        <SelectItem key={h} value={h}>
                          {h.padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <span className="text-muted-foreground font-bold text-lg">:</span>

                {/* Minute */}
                <div className="w-[85px]">
                  <Select value={minute} onValueChange={setMinute}>
                    <SelectTrigger className="bg-background border-muted-foreground/15 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {["00", "15", "30", "45"].map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Period */}
                <div className="w-[85px]">
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="bg-background border-muted-foreground/15 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      {["AM", "PM"].map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end">
        <Button onClick={save} disabled={pending} className="px-6 py-2 shadow-sm transition-all active:scale-95">
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
