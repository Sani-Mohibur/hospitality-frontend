import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet } from "lucide-react";

interface ReportsHeaderProps {
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  onExportCSV: () => void;
  onOpenZReport: () => void;
}

export function ReportsHeader({
  dateRange,
  onDateRangeChange,
  onExportCSV,
  onOpenZReport,
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Retail Analytics & Reports
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          End-of-day register closure, financial summaries, and sales velocity breakdowns.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Select value={dateRange} onValueChange={(val) => val && onDateRangeChange(val)}>
          <SelectTrigger className="w-36 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAY">Today</SelectItem>
            <SelectItem value="YESTERDAY">Yesterday</SelectItem>
            <SelectItem value="LAST_7_DAYS">Last 7 Days</SelectItem>
            <SelectItem value="THIS_MONTH">This Month</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCSV}
          className="h-9 gap-1.5 text-xs border-slate-200"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>

        <Button
          size="sm"
          onClick={onOpenZReport}
          className="h-9 bg-slate-900 hover:bg-slate-800 text-white gap-1.5 text-xs"
        >
          <FileSpreadsheet className="h-4 w-4" />
          End-of-Day Z-Report
        </Button>
      </div>
    </div>
  );
}

