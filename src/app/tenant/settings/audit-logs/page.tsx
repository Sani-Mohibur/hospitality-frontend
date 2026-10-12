"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleGuard } from "@/components/auth/role-guard";
import { Search, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";

interface AuditLogItem {
  _id: string;
  action: string;
  entity?: string;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
  statusCode?: number;
  ipAddress?: string;
  message?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<any>("/audit-log");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data && Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setLogs(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load audit logs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    const actionMatch = log.action?.toLowerCase().includes(q);
    const userMatch =
      log.user?.email?.toLowerCase().includes(q) ||
      log.user?.name?.toLowerCase().includes(q);
    const entityMatch = log.entity?.toLowerCase().includes(q);
    return actionMatch || userMatch || entityMatch;
  });

  return (
    <RoleGuard allowedRoles={["TENANT_OWNER", "TENANT_MANAGER"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tenant Audit Trail</h1>
            <p className="text-sm text-slate-500">Security, permission modifications, and operational history.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchLogs()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-3 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Card className="border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search action, user, or entity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-slate-200 text-xs"
              />
            </div>
          </div>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm">Loading audit events...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-sm">
                No audit log records found matching your filter.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Staff User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const isSuccess =
                      !log.statusCode || (log.statusCode >= 200 && log.statusCode < 400);

                    return (
                      <TableRow
                        key={log._id}
                        onClick={() => setSelectedLog(log)}
                        className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                      >
                        <TableCell className="text-slate-500 text-xs whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 text-xs">
                          {log.action}
                        </TableCell>
                        <TableCell className="text-slate-600 text-xs font-mono">
                          {log.entity || "—"}
                        </TableCell>
                        <TableCell className="text-slate-700 text-xs">
                          {log.user?.name || log.user?.email || "System"}
                        </TableCell>
                        <TableCell className="text-slate-400 text-xs font-mono">
                          {log.ipAddress || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={isSuccess ? "outline" : "destructive"}
                            className={`text-[10px] ${
                              isSuccess ? "text-emerald-700 bg-emerald-50 border-emerald-200" : ""
                            }`}
                          >
                            {isSuccess ? "Success" : `Error ${log.statusCode || 500}`}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Audit Details Modal */}
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Audit Event Details</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4 py-2 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 font-medium">Action</span>
                    <p className="font-bold text-slate-900 text-sm">{selectedLog.action}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Entity</span>
                    <p className="font-semibold text-slate-800">{selectedLog.entity || "—"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Initiator</span>
                    <p className="text-slate-800">
                      {selectedLog.user?.name || selectedLog.user?.email || "System"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Recorded At</span>
                    <p className="text-slate-800">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {selectedLog.message && (
                  <div>
                    <span className="text-slate-400 font-medium">Summary Message</span>
                    <p className="p-2.5 rounded bg-slate-50 border border-slate-100 text-slate-700 mt-1">
                      {selectedLog.message}
                    </p>
                  </div>
                )}

                {selectedLog.details && (
                  <div>
                    <span className="text-slate-400 font-medium">Payload Data</span>
                    <pre className="p-3 rounded bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto mt-1 max-h-48">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
