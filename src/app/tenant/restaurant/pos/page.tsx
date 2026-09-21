import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Utensils, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

const menuCategories = ["All", "Starters", "Mains", "Desserts", "Beverages"];
const menuItems = [
  { id: "M1", name: "Margherita Pizza", price: "$14.00", category: "Mains" },
  { id: "M2", name: "Caesar Salad", price: "$10.00", category: "Starters" },
  { id: "M3", name: "Grilled Salmon", price: "$24.00", category: "Mains" },
  { id: "M4", name: "Tiramisu", price: "$8.00", category: "Desserts" },
  { id: "M5", name: "Craft Beer", price: "$6.00", category: "Beverages" },
  { id: "M6", name: "Garlic Bread", price: "$5.00", category: "Starters" },
];

const currentOrder = [
  { id: "O1", name: "Margherita Pizza", qty: 1, price: 14.00, modifiers: ["Extra Cheese"] },
  { id: "O2", name: "Craft Beer", qty: 2, price: 12.00, modifiers: [] },
];

export default function POSPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Point of Sale</h1>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input placeholder="Search menu..." className="pl-9 h-9" />
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {menuCategories.map(cat => (
            <Button key={cat} variant={cat === "All" ? "default" : "outline"} className="rounded-full">
              {cat}
            </Button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-y-auto pr-2">
          {menuItems.map(item => (
            <Card key={item.id} className="cursor-pointer hover:border-blue-400 transition-colors">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                <Utensils className="w-8 h-8 text-gray-300 mb-2" />
                <h3 className="font-medium text-sm leading-tight mb-1">{item.name}</h3>
                <span className="text-blue-600 font-bold">{item.price}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Order Ticket / Cart */}
      <Card className="w-96 flex flex-col h-full overflow-hidden shrink-0">
        <CardHeader className="border-b bg-slate-50 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Current Order
            </CardTitle>
            <Badge variant="outline" className="bg-white">Table 12</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentOrder.map(item => (
            <div key={item.id} className="flex justify-between items-start border-b pb-3">
              <div>
                <div className="font-medium">{item.name}</div>
                {item.modifiers.map(mod => (
                  <div key={mod} className="text-xs text-gray-500">+ {mod}</div>
                ))}
                <div className="text-sm text-gray-400 mt-1">Qty: {item.qty}</div>
              </div>
              <div className="font-medium text-slate-700">${item.price.toFixed(2)}</div>
            </div>
          ))}
        </CardContent>

        <div className="border-t p-4 bg-slate-50 space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>$26.00</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Tax (10%)</span>
            <span>$2.60</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-800">
            <span>Total</span>
            <span>$28.60</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">Cancel</Button>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700"><Send className="w-4 h-4 mr-2" /> Fire to Kitchen</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
