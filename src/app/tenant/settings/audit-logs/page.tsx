import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleGuard } from "@/components/auth/role-guard";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock Data
const auditLogs = [
  { id: "AL-501", action: "USER_LOGIN", user: "alice@hospitality.com", ip: "192.168.1.1", date: "2023-11-02 08:30:12", status: "SUCCESS" },
  { id: "AL-502", action: "UPDATE_ROOM_STATUS", user: "charlie@hospitality.com", ip: "192.168.1.4", date: "2023-11-02 09:15:00", status: "SUCCESS" },
  { id: "AL-503", action: "DELETE_MENU_ITEM", user: "bob@hospitality.com", ip: "192.168.1.2", date: "2023-11-02 10:05:33", status: "SUCCESS" },
  { id: "AL-504", action: "PROCESS_PAYMENT", user: "charlie@hospitality.com", ip: "192.168.1.4", date: "2023-11-02 11:20:10", status: "FAILED" },
];

export default function AuditLogsPage() {
  return (
    <RoleGuard allowedRoles={["TENANT_OWNER", "TENANT_MANAGER"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-gray-500">View security and operational history for your organization.</p>
        </div>

        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input 
                placeholder="Search action or user..." 
                className="pl-9 h-9"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date / Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-slate-500 text-sm whitespace-nowrap">{log.date}</TableCell>
                    <TableCell className="font-medium text-slate-800">{log.action}</TableCell>
                    <TableCell className="text-slate-500">{log.user}</TableCell>
                    <TableCell className="text-slate-400 text-sm">{log.ip}</TableCell>
                    <TableCell>
                      {log.status === "SUCCESS" 
                        ? <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">Success</Badge>
                        : <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">Failed</Badge>
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
