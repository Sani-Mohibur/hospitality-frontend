import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Barcode, PlayCircle } from "lucide-react";
import { HeldCart } from "./types";

interface PosCatalogHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  barcodeInput: string;
  onBarcodeChange: (value: string) => void;
  onBarcodeScan: (e: React.FormEvent) => void;
  heldCarts: HeldCart[];
  onRestoreHeldCart: (id: string) => void;
}

export function PosCatalogHeader({
  searchQuery,
  onSearchChange,
  barcodeInput,
  onBarcodeChange,
  onBarcodeScan,
  heldCarts,
  onRestoreHeldCart,
}: PosCatalogHeaderProps) {
  return (
    <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search items by name, SKU..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 bg-white"
        />
      </div>

      <form onSubmit={onBarcodeScan} className="flex gap-1.5 w-full sm:w-auto">
        <div className="relative w-44">
          <Barcode className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Scan barcode / SKU"
            value={barcodeInput}
            onChange={(e) => onBarcodeChange(e.target.value)}
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
              onClick={() => onRestoreHeldCart(h.id)}
              className="h-10 text-xs bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 gap-1.5"
            >
              <PlayCircle className="h-4 w-4" />
              {h.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
