"use client";

import { Download, FileSpreadsheet, FileText, FileCode, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExportFormat } from "@/types";

interface Props {
  /** Base export URL, e.g. /api/export/weekly/<id> or /api/export/yearly?year=2026 */
  base: string;
  /** Which formats to offer (defaults to all four). */
  formats?: ExportFormat[];
  size?: "default" | "sm";
}

const META: Record<ExportFormat, { label: string; icon: typeof FileText }> = {
  pdf: { label: "PDF", icon: FileText },
  xlsx: { label: "Excel (.xlsx)", icon: FileSpreadsheet },
  csv: { label: "CSV", icon: FileType },
  markdown: { label: "Markdown", icon: FileCode },
};

export function ExportMenu({ base, formats = ["pdf", "xlsx", "csv", "markdown"], size = "sm" }: Props) {
  const sep = base.includes("?") ? "&" : "?";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Download as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.map((f) => {
          const { label, icon: Icon } = META[f];
          return (
            <DropdownMenuItem key={f} asChild>
              <a href={`${base}${sep}format=${f}`}>
                <Icon className="h-4 w-4" /> {label}
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
