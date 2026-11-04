import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Banknote, Bed, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatMinor } from "@/lib/retail-mock-data";
import { RoomGuest } from "./types";

export type PosPaymentMethod = "CASH" | "CARD" | "ROOM_CHARGE";

export interface ProcessPaymentParams {
  paymentMethod: PosPaymentMethod;
  cashTenderedMinor?: number;
  roomCharge?: {
    roomNumber: string;
    guestLastName: string;
  };
  customerId?: string;
  customerName?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalMinor: number;
  hotelGuests: RoomGuest[];
  isCheckingOut: boolean;
  onProcessPayment: (params: ProcessPaymentParams) => Promise<void>;
}

function CheckoutModalInner({
  onClose,
  totalMinor,
  hotelGuests,
  isCheckingOut,
  onProcessPayment,
}: {
  onClose: () => void;
  totalMinor: number;
  hotelGuests: RoomGuest[];
  isCheckingOut: boolean;
  onProcessPayment: (params: ProcessPaymentParams) => Promise<void>;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>("CARD");
  const [cashTendered, setCashTendered] = useState<string>(
    (totalMinor / 100).toFixed(2)
  );
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<RoomGuest | null>(null);

  const filteredGuests = useMemo(() => {
    if (!roomSearch.trim()) return hotelGuests;
    return hotelGuests.filter(
      (g) =>
        g.roomNumber.toLowerCase().includes(roomSearch.toLowerCase()) ||
        g.guestName.toLowerCase().includes(roomSearch.toLowerCase())
    );
  }, [hotelGuests, roomSearch]);

  const handleSubmit = async () => {
    const tenderedMinor =
      paymentMethod === "CASH"
        ? Math.round(parseFloat(cashTendered || "0") * 100)
        : totalMinor;

    if (paymentMethod === "CASH" && tenderedMinor < totalMinor) {
      toast.error("Tendered cash amount is less than total amount due.");
      return;
    }

    if (paymentMethod === "ROOM_CHARGE" && !selectedGuest && !roomSearch.trim()) {
      toast.error("Please select a valid guest and room for charging.");
      return;
    }

    await onProcessPayment({
      paymentMethod,
      cashTenderedMinor: paymentMethod === "CASH" ? tenderedMinor : undefined,
      roomCharge:
        paymentMethod === "ROOM_CHARGE"
          ? {
              roomNumber: selectedGuest?.roomNumber || roomSearch.trim(),
              guestLastName: selectedGuest?.guestName?.split(" ").slice(-1)[0] || "Guest",
            }
          : undefined,
      customerId: selectedGuest?.customerId,
      customerName: selectedGuest?.guestName,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-slate-900">
          Process Transaction
        </DialogTitle>
        <DialogDescription>
          Total Due:{" "}
          <span className="text-lg font-bold text-slate-900">
            {formatMinor(totalMinor)}
          </span>
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
              Click below to record external card transaction for {formatMinor(totalMinor)}.
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
              {filteredGuests.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  No active stays matching search. You can still enter room number above directly.
                </div>
              ) : (
                filteredGuests.map((g, idx) => (
                  <div
                    key={idx}
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
                    {g.checkOutDate && (
                      <span className="text-[11px] opacity-80">
                        Out: {new Date(g.checkOutDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {(selectedGuest || roomSearch.trim()) && (
              <div className="p-2 bg-blue-50 rounded border border-blue-200 text-xs text-blue-900 flex justify-between items-center">
                <span>
                  Target: <strong>{selectedGuest?.guestName || "Guest"}</strong> (Room{" "}
                  {selectedGuest?.roomNumber || roomSearch})
                </span>
                <Badge variant="outline" className="bg-white text-blue-800 border-blue-300">
                  Folio Direct Post
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="pt-2 border-t border-slate-100">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isCheckingOut}
          className="bg-primary hover:bg-primary/90 text-white font-bold gap-1.5"
        >
          {isCheckingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Complete & Print Receipt
        </Button>
      </DialogFooter>
    </>
  );
}

export function CheckoutModal({
  isOpen,
  onClose,
  totalMinor,
  hotelGuests,
  isCheckingOut,
  onProcessPayment,
}: CheckoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        {isOpen && (
          <CheckoutModalInner
            onClose={onClose}
            totalMinor={totalMinor}
            hotelGuests={hotelGuests}
            isCheckingOut={isCheckingOut}
            onProcessPayment={onProcessPayment}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
