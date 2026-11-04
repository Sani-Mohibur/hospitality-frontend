"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useLocation } from "@/lib/location-context";
import { toast } from "sonner";
import {
  RetailProduct,
  RetailCategory,
  CartItem,
  HeldCart,
  RoomGuest,
  CompletedSale,
  RawCategory,
  RawProduct,
  RawCustomer,
  PriceCheckResponse,
  CheckoutResponse,
  normalizeRetailProduct,
  normalizeRetailCategory,
  normalizeRoomGuest,
  ProcessPaymentParams,
  PosCatalogHeader,
  PosCategoryPills,
  PosProductGrid,
  PosCartPanel,
  CheckoutModal,
  ReceiptModal,
} from "@/components/retail/pos";

export type {
  RetailProduct,
  RetailCategory,
} from "@/components/retail/pos";

export default function RetailPosPage() {
  const { currentLocation, locations } = useLocation();

  const [products, setProducts] = useState<RetailProduct[]>([]);
  const [categories, setCategories] = useState<RetailCategory[]>([]);
  const [hotelGuests, setHotelGuests] = useState<RoomGuest[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [barcodeInput, setBarcodeInput] = useState<string>("");

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);
  const [orderDiscountPercent, setOrderDiscountPercent] = useState<number>(0);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Completed Receipt modal
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);

  // Fetch POS initial catalogue
  useEffect(() => {
    let ignore = false;

    const catPromise = apiClient.get<RawCategory[]>("/retail/category");
    const prodParams: Record<string, string> = {};
    if (currentLocation?._id) {
      prodParams.locationId = currentLocation._id;
    }
    const prodPromise = apiClient.get<RawProduct[]>("/retail/product", { params: prodParams });
    const guestPromise = apiClient.get<RawCustomer[]>("/retail/pos/customers").catch(() => ({
      data: [] as RawCustomer[],
    }));

    Promise.all([catPromise, prodPromise, guestPromise])
      .then(([catRes, prodRes, guestRes]) => {
        if (!ignore) {
          setError(null);
          const rawCats = Array.isArray(catRes.data) ? catRes.data : [];
          setCategories(rawCats.map(normalizeRetailCategory));

          const rawProds = Array.isArray(prodRes.data) ? prodRes.data : [];
          setProducts(rawProds.map(normalizeRetailProduct));

          const rawGuests = Array.isArray(guestRes.data) ? guestRes.data : [];
          setHotelGuests(rawGuests.map(normalizeRoomGuest));
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load POS data";
          setError(msg);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentLocation]);

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
  const handleBarcodeScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    // Check local loaded list first
    const localMatch = products.find(
      (p) =>
        p.barcode === query ||
        p.sku.toLowerCase() === query.toLowerCase()
    );

    if (localMatch) {
      addToCart(localMatch);
      setBarcodeInput("");
      toast.success(`Scanned: ${localMatch.name}`);
      return;
    }

    // Try price check API
    try {
      const res = await apiClient.get<PriceCheckResponse>("/retail/pos/products/price-check", {
        params: { barcode: query, locationId: currentLocation?._id },
      });
      if (res.data?.productId) {
        const item: RetailProduct = {
          _id: res.data.productId,
          name: res.data.name,
          sku: res.data.sku,
          barcode: res.data.barcode,
          categoryId: "",
          priceMinor: res.data.priceMinor,
          costPriceMinor: 0,
          isActive: true,
        };
        addToCart(item);
        setBarcodeInput("");
        toast.success(`Scanned: ${item.name}`);
        return;
      }
    } catch {
      // not found
    }

    toast.error(`No product found with barcode or SKU: ${query}`);
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
    const newHold: HeldCart = {
      id: `hold-${Date.now()}`,
      name: `Ticket #${heldCarts.length + 1} (${cart.length} items)`,
      items: [...cart],
    };
    setHeldCarts((prev) => [...prev, newHold]);
    setCart([]);
    setOrderDiscountPercent(0);
    toast.info("Ticket held");
  };

  const restoreHeldCart = (holdId: string) => {
    const held = heldCarts.find((h) => h.id === holdId);
    if (!held) return;
    setCart(held.items);
    setHeldCarts((prev) => prev.filter((h) => h.id !== holdId));
    toast.success("Held ticket restored");
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

  const handleProcessPayment = async (params: ProcessPaymentParams) => {
    setIsCheckingOut(true);
    try {
      const locId = currentLocation?._id || locations[0]?._id;
      const effectivePayment =
        params.paymentMethod === "CASH"
          ? {
              method: "CASH",
              amountMinor: totalMinor,
              tenderedMinor: params.cashTenderedMinor,
            }
          : params.paymentMethod === "ROOM_CHARGE"
          ? {
              method: "CHARGE_TO_ROOM",
              amountMinor: totalMinor,
              roomCharge: params.roomCharge,
            }
          : {
              method: "CARD_EXTERNAL",
              amountMinor: totalMinor,
            };

      const payload = {
        locationId: locId,
        items: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        discounts:
          orderDiscountPercent > 0
            ? [
                {
                  type: "PERCENT",
                  value: orderDiscountPercent,
                  reason: `POS Discount (${orderDiscountPercent}%)`,
                },
              ]
            : undefined,
        payments: [effectivePayment],
        customerId: params.customerId,
        customerName: params.customerName,
      };

      const res = await apiClient.post<CheckoutResponse>("/retail/pos/checkout", payload);
      const sale = res.data?.sale || res.data;

      const receiptNum = sale?.receiptNumber || `RCP-${Date.now().toString().slice(-6)}`;

      setCompletedSale({
        receiptNumber: receiptNum,
        items: [...cart],
        subtotal: sale?.subtotalMinor || subtotalMinor,
        discount: sale?.discountTotalMinor || discountMinor,
        tax: sale?.taxTotalMinor || taxMinor,
        total: sale?.grandTotalMinor || sale?.totalMinor || totalMinor,
        paymentMethod:
          params.paymentMethod === "ROOM_CHARGE"
            ? "Room Charge"
            : params.paymentMethod === "CASH"
            ? "Cash"
            : "Card",
        tendered: params.paymentMethod === "CASH" ? params.cashTenderedMinor : undefined,
        changeDue:
          params.paymentMethod === "CASH" && params.cashTenderedMinor
            ? params.cashTenderedMinor - totalMinor
            : undefined,
        guestName: params.customerName,
        roomNumber: params.roomCharge?.roomNumber,
        date: new Date().toLocaleString(),
      });

      toast.success(`Sale completed successfully! Receipt ${receiptNum}`);
      setIsCheckoutOpen(false);
      setCart([]);
      setOrderDiscountPercent(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkout transaction failed";
      toast.error(msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)]">
      {/* ─── LEFT PANEL: PRODUCT CATALOG ───────────────────────── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Top Bar with Search & Barcode Simulator */}
        <PosCatalogHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          barcodeInput={barcodeInput}
          onBarcodeChange={setBarcodeInput}
          onBarcodeScan={handleBarcodeScan}
          heldCarts={heldCarts}
          onRestoreHeldCart={restoreHeldCart}
        />

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Category Pills */}
        <PosCategoryPills
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Product Cards Grid */}
        <PosProductGrid
          products={filteredProducts}
          isLoading={isLoading}
          onAddToCart={addToCart}
        />
      </div>

      {/* ─── RIGHT PANEL: REGISTER CART ────────────────────────── */}
      <PosCartPanel
        cart={cart}
        subtotalMinor={subtotalMinor}
        discountMinor={discountMinor}
        taxMinor={taxMinor}
        totalMinor={totalMinor}
        orderDiscountPercent={orderDiscountPercent}
        onSetOrderDiscountPercent={setOrderDiscountPercent}
        onUpdateQuantity={updateQuantity}
        onRemoveFromCart={removeFromCart}
        onHoldCurrentCart={holdCurrentCart}
        onClearCart={clearCart}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* ─── MODAL: CHECKOUT / MULTI-PAYMENT ────────────────────── */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        totalMinor={totalMinor}
        hotelGuests={hotelGuests}
        isCheckingOut={isCheckingOut}
        onProcessPayment={handleProcessPayment}
      />

      {/* ─── MODAL: COMPLETED RECEIPT ───────────────────────────── */}
      <ReceiptModal
        completedSale={completedSale}
        isOpen={!!completedSale}
        onClose={() => setCompletedSale(null)}
      />
    </div>
  );
}
