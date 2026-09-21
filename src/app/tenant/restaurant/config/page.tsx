import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/components/auth/role-guard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { id: "MI-1", name: "Margherita Pizza", category: "Mains", price: "$14.00", modifiers: "2 modifiers" },
  { id: "MI-2", name: "Caesar Salad", category: "Starters", price: "$10.00", modifiers: "1 modifier" },
  { id: "MI-3", name: "Grilled Salmon", category: "Mains", price: "$24.00", modifiers: "None" },
];

export default function RestaurantConfigPage() {
  return (
    <RoleGuard allowedRoles={["TENANT_OWNER", "TENANT_MANAGER"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Restaurant Configuration</h1>
          <p className="text-gray-500">Manage your menu builder, categories, and item modifiers.</p>
        </div>

        <div className="flex gap-4 mb-4">
          <Button variant="default">Menu Items</Button>
          <Button variant="outline">Categories</Button>
          <Button variant="outline">Modifier Groups</Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Menu Items</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Add and manage items available on the POS.</p>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Modifiers</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell className="text-gray-500">{item.modifiers}</TableCell>
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
      </div>
    </RoleGuard>
  );
}
