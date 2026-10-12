"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  MoreHorizontal,
  ShieldAlert,
  Clock,
  Eye,
  Database,
  User as UserIcon,
  MonitorSmartphone,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface AuditLogItem {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  tenantId?: { _id: string; name: string } | string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  details?: Record<string, unknown>;
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 15, total: 0, totalPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Detail Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "15");
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (actionFilter !== "ALL") params.set("action", actionFilter);
      if (entityFilter !== "ALL") params.set("entity", entityFilter);

      const res = await apiClient.get<AuditLogItem[]>(`/audit-log?${params.toString()}`);
      if (res.data) {
        setLogs(res.data);
        if (res.meta) {
          setMeta(res.meta);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load audit logs";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, actionFilter, entityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionStyle = (action: string) => {
    switch (action?.toUpperCase()) {
      case "CREATE": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "UPDATE": return "bg-blue-100 text-blue-700 border-blue-200";
      case "DELETE": return "bg-rose-100 text-rose-700 border-rose-200";
      case "LOGIN": return "bg-purple-100 text-purple-700 border-purple-200";
      case "FAILED_LOGIN": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getEntityIcon = (entity: string) => {
    const lower = entity?.toLowerCase() || "";
    if (lower.includes("user")) return <UserIcon className="w-4 h-4 text-slate-400" />;
    if (lower.includes("tenant")) return <Database className="w-4 h-4 text-slate-400" />;
    return <ShieldAlert className="w-4 h-4 text-slate-400" />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    try {
      return format(date, "MMM d, yyyy 'at' HH:mm:ss");
    } catch {
      return date.toLocaleString();
    }
  };

  const openLogDetails = (log: AuditLogItem) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const getSummary = (log: AuditLogItem) => {
    const details = log.details as Record<string, unknown> | undefined;
    if (details?.url) {
      return `${details.method || log.action} ${details.url}`;
    }
    return `${log.action} action executed on ${log.entity}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Audit Logs</h1>
          <p className="text-slate-500 mt-1">System-wide activity, security events, and configuration changes.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          className="gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={fetchLogs} className="text-xs h-7">Retry</Button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search action, entity, IP, or endpoint URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200"
          />
        </div>
        <div className="flex w-full lg:w-auto gap-4">
          <Select
            value={actionFilter}
            onValueChange={(v) => {
              if (v) {
                setActionFilter(v);
                setCurrentPage(1);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px] bg-slate-50 border-slate-200 cursor-pointer">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="cursor-pointer">All Actions</SelectItem>
              <SelectItem value="CREATE" className="cursor-pointer">Create</SelectItem>
              <SelectItem value="UPDATE" className="cursor-pointer">Update</SelectItem>
              <SelectItem value="DELETE" className="cursor-pointer">Delete / Disable</SelectItem>
              <SelectItem value="LOGIN" className="cursor-pointer">Login</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={entityFilter}
            onValueChange={(v) => {
              if (v) {
                setEntityFilter(v);
                setCurrentPage(1);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px] bg-slate-50 border-slate-200 cursor-pointer">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="cursor-pointer">All Resources</SelectItem>
              <SelectItem value="tenant" className="cursor-pointer">Tenant</SelectItem>
              <SelectItem value="subscription" className="cursor-pointer">Subscription</SelectItem>
              <SelectItem value="platformModule" className="cursor-pointer">Platform Module</SelectItem>
              <SelectItem value="user" className="cursor-pointer">User</SelectItem>
              <SelectItem value="superAdmin" className="cursor-pointer">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Timestamp</TableHead>
                <TableHead className="font-semibold text-slate-700">Action & Resource</TableHead>
                <TableHead className="font-semibold text-slate-700">User / Actor</TableHead>
                <TableHead className="font-semibold text-slate-700 w-[300px]">Details / Target</TableHead>
                <TableHead className="font-semibold text-slate-700">IP Address</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Logs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                      <p className="text-sm">Loading audit logs...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center text-sm text-slate-600 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                        {formatDate(log.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 items-start">
                        <Badge variant="outline" className={`${getActionStyle(log.action)} font-semibold text-[10px] tracking-wide`}>
                          {log.action}
                        </Badge>
                        <div className="flex items-center text-xs font-medium text-slate-600">
                          {getEntityIcon(log.entity)}
                          <span className="ml-1.5 capitalize">{log.entity}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900 text-sm">
                        {log.user?.name || (log.user ? "Admin" : "System / Automated")}
                      </div>
                      <div className="text-xs text-slate-500">
                        {log.user?.email || "internal@system"}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        {log.user?.role || "SYSTEM"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-700 font-mono text-xs truncate max-w-[280px]" title={getSummary(log)}>
                        {getSummary(log)}
                      </p>
                      {log.statusCode && (
                        <span className="text-[10px] font-mono text-slate-400">
                          HTTP {log.statusCode}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs font-mono text-slate-600">
                        <MonitorSmartphone className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                        {log.ipAddress || "::1"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Audit Log Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openLogDetails(log)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-slate-500" /> View JSON Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <ShieldAlert className="w-8 h-8 text-slate-300 mb-3" />
                      <p className="font-medium text-slate-600">No logs found.</p>
                      <p className="text-sm">Try adjusting your filters or search query.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div>
            Showing <span className="font-medium text-slate-700">{logs.length}</span> of{" "}
            <span className="font-medium text-slate-700">{meta.total}</span> logs (Page {meta.page} of {meta.totalPage || 1})
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(meta.totalPage || 1, p + 1))}
              disabled={currentPage >= (meta.totalPage || 1) || loading}
              className="gap-1 cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* View Log Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-slate-500" />
              Audit Log Details
            </DialogTitle>
            <DialogDescription>
              Record ID: <span className="font-mono font-medium text-slate-700">{selectedLog?._id}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Action & Resource</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${getActionStyle(selectedLog.action)}`}>
                      {selectedLog.action}
                    </Badge>
                    <span className="text-sm font-medium text-slate-700 capitalize">{selectedLog.entity}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Timestamp & Status</p>
                  <p className="text-sm font-medium text-slate-800">{formatDate(selectedLog.createdAt)}</p>
                  <p className="text-xs font-mono text-slate-500">
                    HTTP {selectedLog.statusCode || 200} • IP: {selectedLog.ipAddress || "::1"}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Actor / User</p>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900">{selectedLog.user?.name || "System Actor"}</span>
                  <span className="text-sm text-slate-500">({selectedLog.user?.email || "internal@system"})</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-1">Role: {selectedLog.user?.role || "SYSTEM"}</p>
              </div>

              {selectedLog.userAgent && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">User Agent</p>
                  <p className="text-xs font-mono text-slate-600 break-all">{selectedLog.userAgent}</p>
                </div>
              )}

              {selectedLog.details && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Payload / Details (JSON)</p>
                  <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg text-xs font-mono overflow-x-auto shadow-inner max-h-[250px]">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
