import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleGuard } from "@/components/auth/role-guard";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, MoreHorizontal } from "lucide-react";

// Mock Data
const staffMembers = [
  { id: "U-1", name: "Alice Admin", email: "alice@hospitality.com", role: "TENANT_OWNER", status: "ACTIVE" },
  { id: "U-2", name: "Bob Manager", email: "bob@hospitality.com", role: "TENANT_MANAGER", status: "ACTIVE" },
  { id: "U-3", name: "Charlie Staff", email: "charlie@hospitality.com", role: "STAFF", status: "ACTIVE" },
  { id: "U-4", name: "Dave Former", email: "dave@hospitality.com", role: "STAFF", status: "INACTIVE" },
];

function getRoleBadge(role: string) {
  switch (role) {
    case "TENANT_OWNER": return <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200">Owner</Badge>;
    case "TENANT_MANAGER": return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Manager</Badge>;
    case "STAFF": return <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200">Staff</Badge>;
    default: return <Badge variant="outline">{role}</Badge>;
  }
}

export default function StaffSettingsPage() {
  return (
    <RoleGuard allowedRoles={["TENANT_OWNER", "TENANT_MANAGER"]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-gray-500">Manage tenant users, assign roles, and control access.</p>
          </div>
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" /> Invite Staff
          </Button>
        </div>

        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-9 h-9"
              />
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium text-slate-800">{staff.name}</TableCell>
                    <TableCell className="text-slate-500">{staff.email}</TableCell>
                    <TableCell>{getRoleBadge(staff.role)}</TableCell>
                    <TableCell>
                      {staff.status === "ACTIVE" 
                        ? <span className="flex items-center text-emerald-600 text-sm font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Active</span>
                        : <span className="flex items-center text-slate-400 text-sm font-medium"><span className="w-2 h-2 rounded-full bg-slate-300 mr-2"></span> Inactive</span>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
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
