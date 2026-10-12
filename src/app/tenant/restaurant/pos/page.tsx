"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Utensils, Send, Loader2, AlertCircle, Plus, Minus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";

interface OutletItem {
  _id: string;
  name: string;
}

interface MenuCategoryItem {
  _id: string;
  name: string;
}

interface MenuItem {
  _id: string;
  name: string;
  priceMinor: number;
  categoryId: string | { _id: string; name: string };
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

interface TableItem {
  _id: string;
  tableNumber: string;
  outletId: string;
  capacity?: number;
}

interface CartEntry {
  item: MenuItem;
  qty: number;
}

export default function POSPage() {
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [categories, setCategories] = useState<MenuCategoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);

  const [selectedOutletId, setSelectedOutletId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState<CartEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiring, setIsFiring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPosData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [outletsRes, catRes, itemsRes, tablesRes] = await Promise.all([
        apiClient.get<OutletItem[]>("/outlet"),
        apiClient.get<MenuCategoryItem[]>("/restaurant/menu-category"),
        apiClient.get<MenuItem[]>("/restaurant/menu-item"),
        apiClient.get<TableItem[]>("/restaurant/table"),
      ]);

      const oList = Array.isArray(outletsRes.data) ? outletsRes.data : [];
      setOutlets(oList);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setMenuItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      setTables(Array.isArray(tablesRes.data) ? tablesRes.data : []);

      if (oList.length > 0 && !selectedOutletId) {
        setSelectedOutletId(oList[0]._id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load POS catalog.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedOutletId]);

  useEffect(() => {
    fetchPosData();
  }, [fetchPosData]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.isActive === false) return false;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategory === "ALL") return true;
      const catId = typeof item.categoryId === "object" ? item.categoryId?._id : item.categoryId;
      return catId === selectedCategory;
    });
  }, [menuItems, search, selectedCategory]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((e) => e.item._id === item._id);
      if (existing) {
        return prev.map((e) =>
          e.item._id === item._id ? { ...e, qty: e.qty + 1 } : e
        );
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((e) => (e.item._id === itemId ? { ...e, qty: e.qty + delta } : e))
        .filter((e) => e.qty > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((e) => e.item._id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotalMinor = cart.reduce(
    (sum, e) => sum + e.item.priceMinor * e.qty,
    0
  );
  const taxMinor = Math.round(subtotalMinor * 0.1);
  const totalMinor = subtotalMinor + taxMinor;

  const handleFireOrder = async () => {
    if (cart.length === 0) return;
    if (!selectedOutletId) {
      alert("Please select a dining outlet first.");
      return;
    }

    setIsFiring(true);
    setError(null);
    try {
      await apiClient.post("/restaurant/order", {
        outletId: selectedOutletId,
        tableId: selectedTableId || undefined,
        type: selectedTableId ? "DINE_IN" : "TAKEAWAY",
        covers: 1,
        items: cart.map((c) => ({
          menuItemId: c.item._id,
          quantity: c.qty,
        })),
        fire: true,
      });

      setSuccessMsg("Order successfully fired to kitchen!");
      clearCart();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err?.message || "Failed to fire order to kitchen");
    } finally {
      setIsFiring(false);
    }
  };

  const availableTables = selectedOutletId
    ? tables.filter((t) => t.outletId === selectedOutletId)
    : tables;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Point of Sale</h1>
            <p className="text-xs text-slate-500">Live ordering and kitchen dispatch terminal</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {outlets.length > 0 && (
              <select
                value={selectedOutletId}
                onChange={(e) => setSelectedOutletId(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:ring-2 focus:ring-blue-500"
              >
                {outlets.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name}
                  </option>
                ))}
              </select>
            )}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 shrink-0">
          <Button
            size="sm"
            variant={selectedCategory === "ALL" ? "default" : "outline"}
            onClick={() => setSelectedCategory("ALL")}
            className="rounded-full text-xs h-8"
          >
            All Items
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat._id}
              size="sm"
              variant={selectedCategory === cat._id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat._id)}
              className="rounded-full text-xs h-8 whitespace-nowrap"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm">Loading menu items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed">
              No menu items available in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item._id}
                  onClick={() => addToCart(item)}
                  className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all border-slate-200 group"
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                    <Utensils className="w-7 h-7 text-slate-300 group-hover:text-blue-500 transition-colors mb-2" />
                    <h3 className="font-semibold text-xs leading-snug line-clamp-2 text-slate-800 mb-1">
                      {item.name}
                    </h3>
                    <span className="text-blue-600 font-bold text-sm">
                      ${(item.priceMinor / 100).toFixed(2)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Ticket / Cart */}
      <Card className="w-full lg:w-96 flex flex-col h-full overflow-hidden shrink-0 border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/80 p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <ShoppingCart className="w-4 h-4 text-blue-600" /> Current Order
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Takeaway / Bar</option>
                {availableTables.map((t) => (
                  <option key={t._id} value={t._id}>
                    Table {t.tableNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-medium border-b border-emerald-100 text-center">
            {successMsg}
          </div>
        )}

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              <p>Cart is currently empty.</p>
              <p className="text-xs text-slate-400 mt-1">Tap dishes to add to ticket.</p>
            </div>
          ) : (
            cart.map(({ item, qty }) => (
              <div
                key={item._id}
                className="flex justify-between items-center border-b border-slate-100 pb-3"
              >
                <div className="flex-1 pr-2">
                  <div className="font-semibold text-xs text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    ${(item.priceMinor / 100).toFixed(2)} each
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => updateCartQty(item._id, -1)}
                      className="p-1 hover:bg-slate-100 text-slate-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-semibold text-slate-800">{qty}</span>
                    <button
                      onClick={() => updateCartQty(item._id, 1)}
                      className="p-1 hover:bg-slate-100 text-slate-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-bold text-xs text-slate-900 min-w-12 text-right">
                    ${((item.priceMinor * qty) / 100).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-slate-300 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </CardContent>

        <div className="border-t border-slate-100 p-4 bg-slate-50/70 space-y-2 shrink-0">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Subtotal</span>
            <span>${(subtotalMinor / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Estimated Tax (10%)</span>
            <span>${(taxMinor / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
            <span>Total</span>
            <span>${(totalMinor / 100).toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              disabled={cart.length === 0}
              onClick={clearCart}
              className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              Clear
            </Button>
            <Button
              disabled={cart.length === 0 || isFiring}
              onClick={handleFireOrder}
              className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              {isFiring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Fire Kitchen
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
