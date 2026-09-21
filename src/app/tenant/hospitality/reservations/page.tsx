import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus } from "lucide-react";

// Mock Data
const reservations = [
  { id: "RES-001", guest: "Alice Wonderland", room: "101", checkIn: "2023-11-01", checkOut: "2023-11-05", status: "CONFIRMED" },
  { id: "RES-002", guest: "Bob Builder", room: "102", checkIn: "2023-11-02", checkOut: "2023-11-04", status: "IN_HOUSE" },
  { id: "RES-003", guest: "Charlie Chaplin", room: "Unassigned", checkIn: "2023-11-10", checkOut: "2023-11-15", status: "PENDING" },
];

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "CONFIRMED": return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Confirmed</Badge>;
    case "IN_HOUSE": return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">In House</Badge>;
    case "PENDING": return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Pending</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default function ReservationsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reservations</h1>
          <p className="text-gray-500">Manage all incoming and active reservations.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Reservation
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
          <CardTitle className="text-lg">Upcoming Timeline</CardTitle>
          <div className="flex items-center text-sm text-gray-500 border rounded-md px-3 py-1.5 cursor-pointer hover:bg-gray-50">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Nov 1, 2023 - Nov 30, 2023
          </div>
        </CardHeader>
        <CardContent>
          {/* A simple table mimicking a timeline/list view for now */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reservation ID</TableHead>
                <TableHead>Guest Name</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((res) => (
                <TableRow key={res.id}>
                  <TableCell className="font-medium text-blue-600 cursor-pointer">{res.id}</TableCell>
                  <TableCell>{res.guest}</TableCell>
                  <TableCell>{res.room}</TableCell>
                  <TableCell>{res.checkIn}</TableCell>
                  <TableCell>{res.checkOut}</TableCell>
                  <TableCell><StatusBadge status={res.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
