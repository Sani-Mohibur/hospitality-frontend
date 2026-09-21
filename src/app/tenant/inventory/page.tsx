import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PackagePlus, Search, AlertTriangle } from "lucide-react";

// Mock Data
const inventoryItems = [
  { id: "INV-101", name: "Premium Coffee Beans", category: "Beverages", stock: 12, unit: "kg", status: "LOW_STOCK" },
  { id: "INV-102", name: "Toilet Paper (24-pack)", category: "Housekeeping", stock: 45, unit: "packs", status: "IN_STOCK" },
  { id: "INV-103", name: "Draft Beer Kegs", category: "Beverages", stock: 2, unit: "kegs", status: "CRITICAL" },
  { id: "INV-104", name: "Fresh Salmon", category: "Food", stock: 15, unit: "lbs", status: "IN_STOCK" },
  { id: "INV-105", name: "Hand Soap Refills", category: "Housekeeping", stock: 0, unit: "bottles", status: "OUT_OF_STOCK" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "IN_STOCK": return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">In Stock</Badge>;
    case "LOW_STOCK": return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Low Stock</Badge>;
    case "CRITICAL": return <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" /> Critical</Badge>;
    case "OUT_OF_STOCK": return <Badge variant="outline" className="text-slate-600 bg-slate-100 border-slate-300">Out of Stock</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Centralized Inventory</h1>
          <p className="text-gray-500">Track and manage stock levels across all modules.</p>
        </div>
        <Button className="gap-2">
          <PackagePlus className="w-4 h-4" /> Receive Stock
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              placeholder="Search inventory items..." 
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Filter Category</Button>
            <Button variant="outline" size="sm">Filter Status</Button>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-500">{item.id}</TableCell>
                  <TableCell className="font-medium text-slate-800">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right font-medium">
                    {item.stock} <span className="text-slate-400 font-normal text-xs">{item.unit}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
