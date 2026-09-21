import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Plus } from "lucide-react";

// Mock Data
const tables = [
  { id: "T1", seats: 2, status: "AVAILABLE", seatedAt: null, partySize: 0 },
  { id: "T2", seats: 4, status: "OCCUPIED", seatedAt: "12:30 PM", partySize: 3 },
  { id: "T3", seats: 4, status: "NEEDS_CLEANING", seatedAt: null, partySize: 0 },
  { id: "T4", seats: 6, status: "RESERVED", seatedAt: null, partySize: 5 },
  { id: "T5", seats: 2, status: "OCCUPIED", seatedAt: "1:15 PM", partySize: 2 },
  { id: "T6", seats: 8, status: "AVAILABLE", seatedAt: null, partySize: 0 },
];

function getStatusStyle(status: string) {
  switch (status) {
    case "AVAILABLE": return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "OCCUPIED": return "border-blue-200 bg-blue-50 text-blue-700";
    case "NEEDS_CLEANING": return "border-amber-200 bg-amber-50 text-amber-700";
    case "RESERVED": return "border-purple-200 bg-purple-50 text-purple-700";
    default: return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

export default function TablesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Floor Plan</h1>
          <p className="text-gray-500">Live view of restaurant tables and their current status.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Floor Plan</Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Table
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 min-h-[600px]">
        {tables.map((table) => (
          <Card key={table.id} className={`cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md border-2 ${getStatusStyle(table.status)}`}>
            <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center space-y-0">
              <CardTitle className="text-xl font-bold">Table {table.id}</CardTitle>
              <Badge variant="outline" className={`bg-white/80 ${getStatusStyle(table.status)} border-transparent font-semibold shadow-sm`}>
                {table.status.replace("_", " ")}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex justify-between items-center mt-2 text-sm">
                <div className="flex items-center gap-1.5 opacity-80">
                  <Users className="w-4 h-4" /> 
                  <span className="font-medium">{table.status === "OCCUPIED" ? `${table.partySize}/${table.seats}` : `${table.seats} Seats`}</span>
                </div>
                {table.seatedAt && (
                  <div className="flex items-center gap-1.5 opacity-80">
                    <Clock className="w-4 h-4" />
                    <span>{table.seatedAt}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
