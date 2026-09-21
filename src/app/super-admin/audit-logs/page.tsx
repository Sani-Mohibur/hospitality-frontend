"use client";

import React, { useState } from "react";
import { 
  Search, 
  MoreHorizontal, 
  ShieldAlert, 
  Clock, 
  Eye, 
  Database,
  User,
  MonitorSmartphone,
  CheckCircle2,
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

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "FAILED_LOGIN";

interface AuditLog {
  id: string;
  action: AuditAction;
  entity: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  details: string;
  ipAddress: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const initialLogs: AuditLog[] = [
  {
    id: "AL-10045",
    action: "UPDATE",
    entity: "Subscription",
    user: { name: "System Admin", email: "admin@hospitalityos.com", role: "SUPER_ADMIN" },
    details: "Changed billing cycle for TEN-003 to YEARLY.",
    ipAddress: "192.168.1.45",
    timestamp: "2026-09-20T10:15:32Z",
    metadata: {
      previousCycle: "MONTHLY",
      newCycle: "YEARLY",
      tenantId: "TEN-003"
    }
  },
  {
    id: "AL-10044",
    action: "CREATE",
    entity: "Tenant",
    user: { name: "Sarah Jenkins", email: "admin@grandhotel.com", role: "TENANT_OWNER" },
    details: "Onboarded new tenant Grand Hotel & Suites.",
    ipAddress: "10.0.0.12",
    timestamp: "2026-09-19T14:22:10Z",
    metadata: {
      tenantId: "TEN-001",
      modules: ["HOSPITALITY"]
    }
  },
  {
    id: "AL-10043",
    action: "DELETE",
    entity: "Platform Module",
    user: { name: "System Admin", email: "admin@hospitalityos.com", role: "SUPER_ADMIN" },
    details: "Disabled module SPA_SERVICES.",
    ipAddress: "192.168.1.45",
    timestamp: "2026-09-18T09:05:00Z",
    metadata: {
      moduleId: "MOD-005",
      moduleCode: "SPA_SERVICES"
    }
  },
  {
    id: "AL-10042",
    action: "LOGIN",
    entity: "User",
    user: { name: "System Admin", email: "admin@hospitalityos.com", role: "SUPER_ADMIN" },
    details: "Successful login via Web Panel.",
    ipAddress: "192.168.1.45",
    timestamp: "2026-09-18T08:00:12Z",
    metadata: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
    }
  },
  {
    id: "AL-10041",
    action: "FAILED_LOGIN",
    entity: "User",
    user: { name: "Unknown", email: "unknown@example.com", role: "NONE" },
    details: "Failed login attempt (Invalid credentials).",
    ipAddress: "203.0.113.42",
    timestamp: "2026-09-17T22:14:05Z",
    metadata: {
      reason: "Invalid password",
      attemptCount: 3
    }
  },
  {
    id: "AL-10040",
    action: "UPDATE",
    entity: "Platform Module",
    user: { name: "System Admin", email: "admin@hospitalityos.com", role: "SUPER_ADMIN" },
    details: "Updated pricing for RESTAURANT module.",
    ipAddress: "192.168.1.45",
    timestamp: "2026-09-16T15:30:00Z",
    metadata: {
      moduleId: "MOD-002",
      oldPrice: 129,
      newPrice: 149
    }
  }
];

export default function AuditLogsPage() {
  const [logs] = useState<AuditLog[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");

  // Detail Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    const matchesSearch = log.details.toLowerCase().includes(term) || 
                          log.user.email.toLowerCase().includes(term) ||
                          log.user.name.toLowerCase().includes(term) ||
                          log.ipAddress.includes(term);
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    const matchesEntity = entityFilter === "ALL" || log.entity === entityFilter;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionStyle = (action: AuditAction) => {
    switch (action) {
      case "CREATE": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "UPDATE": return "bg-blue-100 text-blue-700 border-blue-200";
      case "DELETE": return "bg-rose-100 text-rose-700 border-rose-200";
      case "LOGIN": return "bg-purple-100 text-purple-700 border-purple-200";
      case "FAILED_LOGIN": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "User": return <User className="w-4 h-4 text-slate-400" />;
      case "Tenant": return <Database className="w-4 h-4 text-slate-400" />;
      default: return <ShieldAlert className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    try {
      return format(date, "MMM d, yyyy 'at' HH:mm:ss");
    } catch {
      return date.toLocaleString();
    }
  };

  const openLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Audit Logs</h1>
          <p className="text-slate-500 mt-1">System-wide activity, security events, and configuration changes.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by user, email, details, or IP..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 bg-slate-50 border-slate-200" 
          />
        </div>
        <div className="flex w-full lg:w-auto gap-4">
          <Select value={actionFilter} onValueChange={(v) => v && setActionFilter(v)}>
            <SelectTrigger className="w-full sm:w-[160px] bg-slate-50 border-slate-200 cursor-pointer">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="cursor-pointer">All Actions</SelectItem>
              <SelectItem value="CREATE" className="cursor-pointer">Create</SelectItem>
              <SelectItem value="UPDATE" className="cursor-pointer">Update</SelectItem>
              <SelectItem value="DELETE" className="cursor-pointer">Delete / Disable</SelectItem>
              <SelectItem value="LOGIN" className="cursor-pointer">Login</SelectItem>
              <SelectItem value="FAILED_LOGIN" className="cursor-pointer">Failed Login</SelectItem>
            </SelectContent>
          </Select>

          <Select value={entityFilter} onValueChange={(v) => v && setEntityFilter(v)}>
            <SelectTrigger className="w-full sm:w-[160px] bg-slate-50 border-slate-200 cursor-pointer">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="cursor-pointer">All Resources</SelectItem>
              <SelectItem value="Tenant" className="cursor-pointer">Tenant</SelectItem>
              <SelectItem value="Subscription" className="cursor-pointer">Subscription</SelectItem>
              <SelectItem value="Platform Module" className="cursor-pointer">Platform Module</SelectItem>
              <SelectItem value="User" className="cursor-pointer">User</SelectItem>
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
                <TableHead className="font-semibold text-slate-700 w-[300px]">Details</TableHead>
                <TableHead className="font-semibold text-slate-700">IP Address</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Logs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center text-sm text-slate-600 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {formatDate(log.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 items-start">
                        <Badge variant="outline" className={`${getActionStyle(log.action)} font-semibold text-[10px] tracking-wide`}>
                          {log.action}
                        </Badge>
                        <div className="flex items-center text-xs font-medium text-slate-600">
                          {getEntityIcon(log.entity)}
                          <span className="ml-1.5">{log.entity}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900 text-sm">{log.user.name}</div>
                      <div className="text-xs text-slate-500">{log.user.email}</div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{log.user.role}</div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-700 line-clamp-2" title={log.details}>
                        {log.details}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs font-mono text-slate-600">
                        <MonitorSmartphone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {log.ipAddress}
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
      </div>

      {/* View Log Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-slate-500" />
              Audit Log Details
            </DialogTitle>
            <DialogDescription>
              Record ID: <span className="font-mono font-medium text-slate-700">{selectedLog?.id}</span>
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
                    <span className="text-sm font-medium text-slate-700">{selectedLog.entity}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Timestamp & IP</p>
                  <p className="text-sm font-medium text-slate-800">{formatDate(selectedLog.timestamp)}</p>
                  <p className="text-xs font-mono text-slate-500">{selectedLog.ipAddress}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Actor / User</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900">{selectedLog.user.name}</span>
                  <span className="text-sm text-slate-500">({selectedLog.user.email})</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-1">{selectedLog.user.role}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Activity Summary</p>
                <p className="text-sm text-slate-800">{selectedLog.details}</p>
              </div>

              {selectedLog.metadata && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Payload / Metadata (JSON)</p>
                  <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg text-xs font-mono overflow-x-auto shadow-inner">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
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
