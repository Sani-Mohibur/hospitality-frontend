import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const activeFolios = [
  { id: "FOL-101", guest: "Alice Wonderland", room: "101", balance: "$450.00", status: "OPEN" },
  { id: "FOL-102", guest: "Bob Builder", room: "102", balance: "$0.00", status: "SETTLED" },
];

const ledgerItems = [
  { id: "LI-1", date: "2023-11-01 14:30", description: "Room Charge - Night 1", amount: "$150.00", type: "CHARGE" },
  { id: "LI-2", date: "2023-11-01 19:45", description: "Restaurant - Dinner", amount: "$85.00", type: "CHARGE" },
  { id: "LI-3", date: "2023-11-02 14:30", description: "Room Charge - Night 2", amount: "$150.00", type: "CHARGE" },
  { id: "LI-4", date: "2023-11-02 15:00", description: "Spa Services", amount: "$65.00", type: "CHARGE" },
];

export default function FoliosPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guest Folios</h1>
          <p className="text-gray-500">Manage billing ledgers and process payments.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Folio List Sidebar */}
        <Card className="w-1/3 flex flex-col overflow-hidden">
          <div className="p-4 border-b font-medium bg-slate-50 text-slate-700">
            Active Folios
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {activeFolios.map((folio) => (
              <div 
                key={folio.id} 
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${folio.id === "FOL-101" ? "border-blue-500 bg-blue-50" : "hover:bg-slate-50 border-transparent"}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-slate-800">{folio.guest}</span>
                  <Badge variant={folio.status === "OPEN" ? "default" : "secondary"} className="text-[10px]">
                    {folio.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Room {folio.room}</span>
                  <span className="font-medium text-slate-700">{folio.balance}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Selected Folio Ledger */}
        <Card className="w-2/3 flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 shrink-0 bg-slate-50">
            <div>
              <CardTitle className="text-lg">Alice Wonderland - Room 101</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Folio ID: FOL-101</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> PDF</Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"><CreditCard className="w-4 h-4 mr-2" /> Process Payment</Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <Table>
              <TableHeader className="bg-white sticky top-0 shadow-sm">
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-slate-500 text-sm whitespace-nowrap">{item.date}</TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right font-medium text-slate-700">{item.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <div className="p-4 border-t bg-slate-50 shrink-0 flex justify-between items-center">
            <span className="text-slate-500 font-medium">Total Balance Due</span>
            <span className="text-2xl font-bold text-slate-800">$450.00</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
