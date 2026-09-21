import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/components/auth/role-guard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Plus, Trash2 } from "lucide-react";

const categories = [
  { id: "RC-1", name: "Standard", capacity: 2, basePrice: "$120.00" },
  { id: "RC-2", name: "Deluxe", capacity: 3, basePrice: "$180.00" },
  { id: "RC-3", name: "Suite", capacity: 4, basePrice: "$350.00" },
];

export default function HospitalityConfigPage() {
  return (
    <RoleGuard allowedRoles={["TENANT_OWNER", "TENANT_MANAGER"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hospitality Configuration</h1>
          <p className="text-gray-500">Manage room categories, physical rooms, and hospitality settings.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Room Categories</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Define types of rooms available in this location.</p>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>{cat.capacity} Persons</TableCell>
                    <TableCell>{cat.basePrice}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Placeholder for Physical Rooms Management */}
        <Card className="opacity-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Physical Rooms</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Map physical room numbers to categories.</p>
            </div>
            <Button size="sm" disabled className="gap-2">
              <Plus className="w-4 h-4" /> Add Room
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-gray-400 py-8">Select a category to manage its physical rooms.</p>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
