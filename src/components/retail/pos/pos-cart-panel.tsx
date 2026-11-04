import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  PauseCircle,
  Trash2,
  Minus,
  Plus,
  Percent,
  CreditCard,
} from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { CartItem } from "./types";

interface PosCartPanelProps {
  cart: CartItem[];
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  orderDiscountPercent: number;
  onSetOrderDiscountPercent: (percent: number) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onHoldCurrentCart: () => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export function PosCartPanel({
  cart,
  subtotalMinor,
  discountMinor,
  taxMinor,
  totalMinor,
  orderDiscountPercent,
  onSetOrderDiscountPercent,
  onUpdateQuantity,
  onRemoveFromCart,
  onHoldCurrentCart,
  onClearCart,
  onOpenCheckout,
}: PosCartPanelProps) {
  return (
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
                onClick={onHoldCurrentCart}
                title="Hold Cart"
              >
                <PauseCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-rose-500 hover:bg-rose-50"
                onClick={onClearCart}
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
                  onClick={() => onUpdateQuantity(item.product._id, -1)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center font-bold text-slate-900">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.product._id, 1)}
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
                onClick={() => onRemoveFromCart(item.product._id)}
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
                onClick={() => onSetOrderDiscountPercent(pct)}
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
          onClick={onOpenCheckout}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md gap-2 mt-2"
        >
          <CreditCard className="h-5 w-5" />
          Charge {formatMinor(totalMinor)}
        </Button>
      </div>
    </Card>
  );
}
