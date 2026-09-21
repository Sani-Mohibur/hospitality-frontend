import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, CheckCircle, RefreshCcw, XCircle } from "lucide-react";

// Mock Data
const rooms = [
  { id: "101", type: "Standard", status: "CLEAN", guest: null },
  { id: "102", type: "Standard", status: "OCCUPIED", guest: "John Doe" },
  { id: "103", type: "Deluxe", status: "DIRTY", guest: null },
  { id: "104", type: "Suite", status: "OUT_OF_ORDER", guest: null },
  { id: "105", type: "Standard", status: "CLEAN", guest: null },
  { id: "106", type: "Deluxe", status: "OCCUPIED", guest: "Jane Smith" },
];

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "CLEAN": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case "OCCUPIED": return <BedDouble className="w-5 h-5 text-blue-500" />;
    case "DIRTY": return <RefreshCcw className="w-5 h-5 text-amber-500" />;
    case "OUT_OF_ORDER": return <XCircle className="w-5 h-5 text-red-500" />;
    default: return null;
  }
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "CLEAN": return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">Clean</Badge>;
    case "OCCUPIED": return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Occupied</Badge>;
    case "DIRTY": return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Dirty</Badge>;
    case "OUT_OF_ORDER": return <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">Out of Order</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default function RoomsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Room Board</h1>
          <p className="text-gray-500">Live overview of all rooms and their current status.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Filter Status</Button>
          <Button variant="outline">Bulk Actions</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start space-y-0">
              <CardTitle className="text-xl font-bold">{room.id}</CardTitle>
              <StatusIcon status={room.status} />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-gray-500 font-medium mb-3">{room.type}</p>
              <div className="flex justify-between items-end">
                <StatusBadge status={room.status} />
              </div>
              {room.guest && (
                <div className="mt-3 pt-3 border-t text-xs">
                  <span className="text-gray-500">Guest:</span> <span className="font-medium text-gray-800">{room.guest}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
