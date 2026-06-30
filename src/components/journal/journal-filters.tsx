"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X, Download, FileText, FileSpreadsheet, FileCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const ALL = "__all__";

export function JournalFilters({ projects }: { projects: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = React.useState(params.get("search") ?? "");

  const push = React.useCallback(
    (next: Record<string, string | undefined>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v) sp.set(k, v);
        else sp.delete(k);
      }
      router.push(`${pathname}?${sp.toString()}`);
    },
    [params, pathname, router],
  );

  // Debounce the free-text search.
  React.useEffect(() => {
    const id = setTimeout(() => {
      if (search !== (params.get("search") ?? "")) push({ search: search || undefined });
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilters =
    params.get("search") || params.get("project") || params.get("from") || params.get("to");

  function handleExport(format: string) {
    const sp = new URLSearchParams(params.toString());
    sp.set("format", format);
    window.location.href = `/api/export/journal?${sp.toString()}`;
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
      <div className="grid min-w-[200px] flex-1 gap-1.5">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            className="pl-8"
            placeholder="Search notes, tasks, tech…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>Project</Label>
        <Select
          value={params.get("project") ?? ALL}
          onValueChange={(v) => push({ project: v === ALL ? undefined : v })}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          type="date"
          className="w-40"
          defaultValue={params.get("from") ?? ""}
          onChange={(e) => push({ from: e.target.value || undefined })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          type="date"
          className="w-40"
          defaultValue={params.get("to") ?? ""}
          onChange={(e) => push({ to: e.target.value || undefined })}
        />
      </div>

      <div className="flex items-center gap-2">
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              router.push(pathname);
            }}
            className="h-9 px-3"
          >
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-3 gap-1.5 border-muted-foreground/10 hover:border-primary/30 transition-all duration-300">
              <Download className="h-4 w-4 text-muted-foreground" /> Export logs
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-muted-foreground/10 bg-popover text-popover-foreground">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Choose format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2.5">
              <FileText className="h-4 w-4 text-rose-500" /> Export to PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("xlsx")} className="gap-2.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export to Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2.5">
              <FileCode className="h-4 w-4 text-blue-500" /> Export to CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
