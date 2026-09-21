import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus } from "lucide-react";

const guests = [
  { id: "G-1001", name: "Alice Wonderland", email: "alice@example.com", phone: "+1 555-0101", lifetimeValue: "$1,250", stays: 3 },
  { id: "G-1002", name: "Bob Builder", email: "bob@example.com", phone: "+1 555-0102", lifetimeValue: "$450", stays: 1 },
  { id: "G-1003", name: "Charlie Chaplin", email: "charlie@example.com", phone: "+1 555-0103", lifetimeValue: "$0", stays: 0 },
];

export default function GuestsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guest Directory</h1>
          <p className="text-gray-500">Manage guest profiles, history, and contact details.</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" /> Add Guest
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              placeholder="Search guests by name or email..." 
              className="pl-9 h-9"
            />
          </div>
          <Button variant="outline" size="sm">Filter</Button>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Stays</TableHead>
                <TableHead>Lifetime Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-500">{guest.id}</TableCell>
                  <TableCell className="font-medium text-blue-600">{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.phone}</TableCell>
                  <TableCell>{guest.stays}</TableCell>
                  <TableCell>{guest.lifetimeValue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
