"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Bed,
  CheckCircle2,
  Printer,
  RotateCcw,
  Tag,
  Percent,
  Receipt,
  PauseCircle,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import {
  mockProducts,
  mockCategories,
  RetailProduct,
  formatMinor,
} from "@/lib/retail-mock-data";

interface CartItem {
  product: RetailProduct;
  quantity: number;
  unitPriceMinor: number;
  discountMinor: number;
}

interface RoomGuest {
  roomNumber: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  balanceMinor: number;
}

const mockHotelGuests: RoomGuest[] = [
  { roomNumber: "101", guestName: "Michael Chang", checkInDate: "2025-11-08", checkOutDate: "2025-11-12", balanceMinor: 45000 },
  { roomNumber: "204", guestName: "Sarah Jenkins", checkInDate: "2025-11-09", checkOutDate: "2025-11-14", balanceMinor: 12000 },
  { roomNumber: "305", guestName: "David Miller", checkInDate: "2025-11-10", checkOutDate: "2025-11-13", balanceMinor: 89000 },
  { roomNumber: "408", guestName: "Elena Rostova", checkInDate: "2025-11-07", checkOutDate: "2025-11-11", balanceMinor: 25000 },
];

export default function RetailPosPage() {
  const [products] = useState<RetailProduct[]>(mockProducts);
  const [categories] = useState(mockCategories);

  // Search & Filter
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [barcodeInput, setBarcodeInput] = useState<string>("");

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldCarts, setHeldCarts] = useState<{ id: string; name: string; items: CartItem[] }[]>([]);
  const [orderDiscountPercent, setOrderDiscountPercent] = useState<number>(0);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "ROOM_CHARGE">("CARD");
  const [cashTendered, setCashTendered] = useState<string>("");

  // Room charge state
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<RoomGuest | null>(null);

  // Completed Receipt modal
  const [completedSale, setCompletedSale] = useState<{
    receiptNumber: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: string;
    tendered?: number;
    changeDue?: number;
    guestName?: string;
    roomNumber?: string;
    date: string;
  } | null>(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;
      const matchesCat = selectedCategory === "ALL" || p.categoryId === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Barcode scanner simulation
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matchedProduct = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matchedProduct) {
      addToCart(matchedProduct);
      setBarcodeInput("");
    } else {
      alert(`No product found with barcode or SKU: ${barcodeInput}`);
    }
  };

  // Cart Operations
  const addToCart = (product: RetailProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unitPriceMinor: product.priceMinor,
          discountMinor: 0,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setOrderDiscountPercent(0);
  };

  const holdCurrentCart = () => {
    if (cart.length === 0) return;
    const newHold = {
      id: `hold-${Date.now()}`,
      name: `Ticket #${heldCarts.length + 1} (${cart.length} items)`,
      items: [...cart],
    };
    setHeldCarts((prev) => [...prev, newHold]);
    setCart([]);
    setOrderDiscountPercent(0);
  };

  const restoreHeldCart = (holdId: string) => {
    const held = heldCarts.find((h) => h.id === holdId);
    if (!held) return;
    setCart(held.items);
    setHeldCarts((prev) => prev.filter((h) => h.id !== holdId));
  };

  // Computations
  const subtotalMinor = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceMinor - item.discountMinor,
    0
  );
  const discountMinor = Math.round((subtotalMinor * orderDiscountPercent) / 100);
  const discountedSubtotal = subtotalMinor - discountMinor;
  const taxMinor = Math.round(discountedSubtotal * 0.1); // 10% tax
  const totalMinor = discountedSubtotal + taxMinor;

  // Payment processing
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setPaymentMethod("CARD");
    setCashTendered((totalMinor / 100).toFixed(2));
    setSelectedGuest(null);
    setRoomSearch("");
    setIsCheckoutOpen(true);
  };

  const handleProcessPayment = () => {
    const tenderedMinor =
      paymentMethod === "CASH" ? Math.round(parseFloat(cashTendered || "0") * 100) : totalMinor;

    if (paymentMethod === "CASH" && tenderedMinor < totalMinor) {
      alert("Tendered cash amount is less than total amount due.");
      return;
    }

    if (paymentMethod === "ROOM_CHARGE" && !selectedGuest) {
      alert("Please select a valid guest and room for charging.");
      return;
    }

    const receiptNum = `RCP-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    setCompletedSale({
      receiptNumber: receiptNum,
      items: [...cart],
      subtotal: subtotalMinor,
      discount: discountMinor,
      tax: taxMinor,
      total: totalMinor,
      paymentMethod,
      tendered: paymentMethod === "CASH" ? tenderedMinor : undefined,
      changeDue: paymentMethod === "CASH" ? tenderedMinor - totalMinor : undefined,
      guestName: selectedGuest?.guestName,
      roomNumber: selectedGuest?.roomNumber,
      date: new Date().toLocaleString(),
    });

    setIsCheckoutOpen(false);
    setCart([]);
    setOrderDiscountPercent(0);
  };

  // Filtered hotel guests
  const filteredGuests = useMemo(() => {
    if (!roomSearch.trim()) return mockHotelGuests;
    return mockHotelGuests.filter(
      (g) =>
        g.roomNumber.includes(roomSearch) ||
        g.guestName.toLowerCase().includes(roomSearch.toLowerCase())
    );
  }, [roomSearch]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)]">
      {/* ─── LEFT PANEL: PRODUCT CATALOG ───────────────────────── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Top Bar with Search & Barcode Simulator */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search items by name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white"
            />
          </div>

          <form onSubmit={handleBarcodeScan} className="flex gap-1.5 w-full sm:w-auto">
            <div className="relative w-44">
              <Barcode className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Scan barcode / SKU"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="pl-8 h-10 text-xs font-mono bg-white"
              />
            </div>
            <Button type="submit" variant="secondary" className="h-10 text-xs gap-1">
              Add
            </Button>
          </form>

          {heldCarts.length > 0 && (
            <div className="flex gap-1">
              {heldCarts.map((h) => (
                <Button
                  key={h.id}
                  variant="outline"
                  size="sm"
                  onClick={() => restoreHeldCart(h.id)}
                  className="h-10 text-xs bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 gap-1.5"
                >
                  <PlayCircle className="h-4 w-4" />
                  {h.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Products
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c._id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredProducts.map((p) => (
              <Card
                key={p._id}
                onClick={() => addToCart(p)}
                className="cursor-pointer border-slate-200 hover:border-primary/50 hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden bg-white active:scale-[0.98]"
              >
                <div className="p-3.5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[10px] font-mono uppercase font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {p.categoryName}
                      </span>
                      {p.hasVariants && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0">
                          Variants
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mt-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {p.name}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{p.sku}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-base">
                      {formatMinor(p.priceMinor)}
                    </span>
                    <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: REGISTER CART ────────────────────────── */}
      <Card className="w-full lg:w-96 flex flex-col border-slate-200 shadow-md bg-white">
        <CardHeader className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-slate-700" />
            <CardTitle className="text-base font-bold text-slate-900">Current Sale</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                  onClick={holdCurrentCart}
                  title="Hold Cart"
                >
                  <PauseCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-rose-500 hover:bg-rose-50"
                  onClick={clearCart}
                  title="Clear Cart"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <ShoppingCart className="h-10 w-10 text-slate-200 mb-2" />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs text-slate-400 mt-1">
                Scan barcode or click items to add them to this ticket
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product._id}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                    {formatMinor(item.unitPriceMinor)} ea
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md p-0.5">
                  <button
                    onClick={() => updateQuantity(item.product._id, -1)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, 1)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="text-right w-16">
                  <p className="font-bold text-slate-900">
                    {formatMinor(item.quantity * item.unitPriceMinor)}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.product._id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pricing Summary */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Subtotal</span>
            <span>{formatMinor(subtotalMinor)}</span>
          </div>

          {/* Discount Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1">
              <Percent className="h-3 w-3 text-slate-400" />
              Order Discount
            </span>
            <div className="flex gap-1">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setOrderDiscountPercent(pct)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                    orderDiscountPercent === pct
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {discountMinor > 0 && (
            <div className="flex justify-between text-xs text-emerald-600 font-medium">
              <span>Discount ({orderDiscountPercent}%)</span>
              <span>-{formatMinor(discountMinor)}</span>
            </div>
          )}

          <div className="flex justify-between text-xs text-slate-600">
            <span>Tax (10%)</span>
            <span>{formatMinor(taxMinor)}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total</span>
            <span className="text-xl font-black text-slate-900">{formatMinor(totalMinor)}</span>
          </div>

          {/* Charge / Pay Button */}
          <Button
            disabled={cart.length === 0}
            onClick={handleOpenCheckout}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md gap-2 mt-2"
          >
            <CreditCard className="h-5 w-5" />
            Charge {formatMinor(totalMinor)}
          </Button>
        </div>
      </Card>

      {/* ─── MODAL: CHECKOUT / MULTI-PAYMENT ────────────────────── */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Process Transaction
            </DialogTitle>
            <DialogDescription>
              Total Due: <span className="text-lg font-bold text-slate-900">{formatMinor(totalMinor)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === "CARD"
                    ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs font-bold">Credit / Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === "CASH"
                    ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Banknote className="h-5 w-5" />
                <span className="text-xs font-bold">Cash Tender</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("ROOM_CHARGE")}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === "ROOM_CHARGE"
                    ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Bed className="h-5 w-5" />
                <span className="text-xs font-bold">Room Charge</span>
              </button>
            </div>

            {/* CARD MODE */}
            {paymentMethod === "CARD" && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-2">
                <CreditCard className="h-8 w-8 text-primary mx-auto animate-pulse" />
                <p className="text-sm font-semibold text-slate-900">Card Terminal Ready</p>
                <p className="text-xs text-slate-500">
                  Tap or insert card on the integrated payment reader for {formatMinor(totalMinor)}.
                </p>
              </div>
            )}

            {/* CASH MODE */}
            {paymentMethod === "CASH" && (
              <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-700">Cash Amount Tendered ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="h-10 text-lg font-bold font-mono"
                  />
                </div>

                {/* Quick cash pills */}
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setCashTendered((totalMinor / 100).toFixed(2))}
                  >
                    Exact
                  </Button>
                  {[20, 50, 100].map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setCashTendered(amt.toFixed(2))}
                    >
                      ${amt}
                    </Button>
                  ))}
                </div>

                {/* Change due */}
                {parseFloat(cashTendered || "0") * 100 >= totalMinor && (
                  <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 flex justify-between items-center text-sm">
                    <span className="text-emerald-800 font-medium">Change to return:</span>
                    <span className="text-emerald-900 font-bold text-base">
                      {formatMinor(Math.round(parseFloat(cashTendered) * 100) - totalMinor)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ROOM CHARGE MODE */}
            {paymentMethod === "ROOM_CHARGE" && (
              <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-700">
                    Search Checked-In Guest / Room #
                  </Label>
                  <Input
                    placeholder="Search room (e.g. 101) or guest name..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 rounded p-1 bg-white">
                  {filteredGuests.map((g) => (
                    <div
                      key={g.roomNumber}
                      onClick={() => setSelectedGuest(g)}
                      className={`p-2 rounded text-xs cursor-pointer flex justify-between items-center transition-colors ${
                        selectedGuest?.roomNumber === g.roomNumber
                          ? "bg-primary text-white"
                          : "hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      <div>
                        <span className="font-bold mr-2">Room {g.roomNumber}</span>
                        <span>{g.guestName}</span>
                      </div>
                      <span className="text-[11px] opacity-80">
                        Out: {new Date(g.checkOutDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedGuest && (
                  <div className="p-2 bg-blue-50 rounded border border-blue-200 text-xs text-blue-900 flex justify-between items-center">
                    <span>
                      Selected: <strong>{selectedGuest.guestName}</strong> (Room {selectedGuest.roomNumber})
                    </span>
                    <Badge variant="outline" className="bg-white text-blue-800 border-blue-300">
                      Charge Approved
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessPayment}
              className="bg-primary hover:bg-primary/90 text-white font-bold gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete & Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: COMPLETED RECEIPT ───────────────────────────── */}
      <Dialog open={!!completedSale} onOpenChange={(open) => !open && setCompletedSale(null)}>
        <DialogContent className="max-w-sm">
          {completedSale && (
            <div className="space-y-4 text-center font-sans">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Payment Successful</h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">{completedSale.receiptNumber}</p>
                <p className="text-[11px] text-slate-400">{completedSale.date}</p>
              </div>

              {/* Receipt slip layout */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-left space-y-2">
                <div className="border-b border-dashed border-slate-300 pb-2 space-y-1">
                  {completedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-slate-800">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-mono text-slate-900">
                        {formatMinor(item.quantity * item.unitPriceMinor)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatMinor(completedSale.subtotal)}</span>
                  </div>
                  {completedSale.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span className="font-mono">-{formatMinor(completedSale.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span className="font-mono">{formatMinor(completedSale.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Paid:</span>
                    <span className="font-mono text-sm">{formatMinor(completedSale.total)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-2 text-[11px] text-slate-500">
                  <p>
                    Method: <strong>{completedSale.paymentMethod}</strong>
                  </p>
                  {completedSale.roomNumber && (
                    <p>
                      Charged to Room: {completedSale.roomNumber} ({completedSale.guestName})
                    </p>
                  )}
                  {completedSale.changeDue !== undefined && (
                    <p>Change Returned: {formatMinor(completedSale.changeDue)}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1 text-xs"
                  onClick={() => alert("Printing simulated receipt...")}
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
                <Button
                  className="flex-1 bg-primary text-white text-xs"
                  onClick={() => setCompletedSale(null)}
                >
                  Next Sale
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
