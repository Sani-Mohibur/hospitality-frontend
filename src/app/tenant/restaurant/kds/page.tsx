import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";

// Mock Data
const kdsOrders = [
  { 
    id: "ORD-902", table: "12", time: "2m ago", status: "NEW", items: [
      { name: "Margherita Pizza", qty: 1, mods: ["Extra Cheese", "No Basil"] },
      { name: "Craft Beer", qty: 2, mods: [] }
    ] 
  },
  { 
    id: "ORD-901", table: "4", time: "8m ago", status: "COOKING", items: [
      { name: "Grilled Salmon", qty: 2, mods: ["Medium Rare"] },
      { name: "Caesar Salad", qty: 1, mods: ["Dressing on side"] }
    ] 
  },
  { 
    id: "ORD-900", table: "7", time: "15m ago", status: "READY", items: [
      { name: "Tiramisu", qty: 3, mods: [] }
    ] 
  }
];

function getStatusColor(status: string) {
  switch (status) {
    case "NEW": return "bg-red-500 text-white";
    case "COOKING": return "bg-amber-500 text-white";
    case "READY": return "bg-emerald-500 text-white";
    default: return "bg-gray-500 text-white";
  }
}

export default function KDSPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kitchen Display System</h1>
          <p className="text-gray-500">Live order queue for the kitchen staff.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white px-3 py-1 text-sm border-dashed">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Live Sync Active
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-900 p-6 rounded-xl shadow-inner border flex gap-4">
        {kdsOrders.map((order) => (
          <Card key={order.id} className="w-80 shrink-0 flex flex-col h-full bg-white shadow-xl overflow-hidden border-0">
            <CardHeader className={`p-4 ${getStatusColor(order.status)}`}>
              <div className="flex justify-between items-center mb-1">
                <CardTitle className="text-lg font-bold">Table {order.table}</CardTitle>
                <span className="text-sm font-semibold tracking-wider">{order.status}</span>
              </div>
              <div className="flex justify-between items-center text-sm opacity-90">
                <span>#{order.id}</span>
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {order.time}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              <ul className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <li key={idx} className="p-4">
                    <div className="flex justify-between items-start font-medium text-slate-800 text-lg">
                      <span><span className="text-blue-600 mr-1">{item.qty}x</span> {item.name}</span>
                    </div>
                    {item.mods.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.mods.map(mod => (
                          <div key={mod} className="text-sm text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-md inline-block mr-2">
                            + {mod}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-4 border-t bg-slate-50">
              {order.status === "NEW" && (
                <Button className="w-full bg-amber-500 hover:bg-amber-600">Start Cooking</Button>
              )}
              {order.status === "COOKING" && (
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="w-4 h-4 mr-2" /> Mark Ready</Button>
              )}
              {order.status === "READY" && (
                <Button variant="outline" className="w-full">Clear from KDS</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
