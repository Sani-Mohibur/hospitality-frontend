"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PACKAGES, TIERS, PackageId, BillingCycle, TRIAL_DAYS } from "@/lib/marketing/plans";
import { apiFetch } from "@/lib/api";
import { ctaClass } from "@/components/home/primitives";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  X,
} from "lucide-react";

interface MockCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPkg: PackageId;
  selectedTierId: "essentials" | "professional";
  cycle: BillingCycle;
  onPaymentSuccess: () => Promise<void>;
}

export function MockCheckoutModal({
  isOpen,
  onClose,
  selectedPkg,
  selectedTierId,
  cycle,
  onPaymentSuccess,
}: MockCheckoutModalProps) {
  const router = useRouter();
  const [checkoutStep, setCheckoutStep] = useState<"review" | "processing" | "success" | "failed">("review");
  const [paymentErrorMessage, setPaymentErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const packageInfo = PACKAGES[selectedPkg];
  const tierInfo = TIERS[selectedPkg].find((t) => t.id === selectedTierId) || TIERS[selectedPkg][1];

  const handleClose = () => {
    if (!isSubmitting) {
      setCheckoutStep("review");
      setPaymentErrorMessage("");
      onClose();
    }
  };

  const executeMockPayment = async (simulateSuccess: boolean) => {
    setIsSubmitting(true);
    setPaymentErrorMessage("");
    setCheckoutStep("processing");

    // Simulate payment gateway round-trip delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!simulateSuccess) {
      setIsSubmitting(false);
      setCheckoutStep("failed");
      setPaymentErrorMessage(
        "Payment authorization declined (simulated). Insufficient funds or test card decline. No changes were made to your account."
      );
      return;
    }

    try {
      const res = await apiFetch("/subscription/subscribe", {
        method: "POST",
        body: JSON.stringify({
          packageId: selectedPkg,
          tierId: selectedTierId,
          billingCycle: cycle === "annual" ? "YEARLY" : "MONTHLY",
          modules: packageInfo.modules,
          planName: `${packageInfo.name} (${tierInfo.name})`,
          mockPaymentSuccess: true,
          paymentRef: `MOCK_TX_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await onPaymentSuccess();
        setCheckoutStep("success");
      } else {
        setCheckoutStep("failed");
        setPaymentErrorMessage(data.message || "Failed to activate subscription. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setCheckoutStep("failed");
      setPaymentErrorMessage("An unexpected network error occurred while connecting to the billing engine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-ink/10 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone hover:text-ink hover:bg-ink/5 transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {checkoutStep === "review" && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-champagne/20 text-champagne-dark mb-3">
              <CreditCard className="size-3.5" />
              <span>Mock Checkout Simulation</span>
            </div>
            <h3 className="font-display text-2xl text-ink font-normal">
              Review &amp; Confirm Subscription
            </h3>
            <p className="text-xs text-stone mt-1">
              Select your test payment outcome below. No actual credit card charges will occur.
            </p>

            {/* Plan Review Box */}
            <div className="mt-6 rounded-2xl bg-ivory/70 p-5 border border-ink/10 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone">Selected Package:</span>
                <span className="font-semibold text-ink">{packageInfo.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone">Tier Level:</span>
                <span className="font-medium capitalize text-ink">{selectedTierId}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone">Billing Cadence:</span>
                <span className="font-medium text-ink">
                  {cycle === "annual" ? "Annual Billing (20% Discount)" : "Monthly Billing"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone">Included Modules:</span>
                <div className="flex gap-1.5">
                  {packageInfo.modules.map((m) => (
                    <span
                      key={m}
                      className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-ink/10 text-ink"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-ink/10 flex justify-between items-baseline">
                <span className="font-semibold text-ink text-sm">Total Due Today:</span>
                <div className="text-right">
                  <span className="font-display text-2xl font-bold text-ink">$0.00</span>
                  <span className="block text-[11px] text-stone">
                    {TRIAL_DAYS}-day free evaluation included
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Simulator Actions */}
            <div className="mt-8 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-ink">
                Simulate Payment Provider Response:
              </p>

              <button
                type="button"
                onClick={() => executeMockPayment(true)}
                className={cn(
                  ctaClass("gold", "lg"),
                  "w-full justify-center shadow-md shadow-champagne/20 cursor-pointer"
                )}
              >
                <CheckCircle2 className="size-4 mr-1 text-ink" />
                <span>Simulate Successful Payment</span>
              </button>

              <button
                type="button"
                onClick={() => executeMockPayment(false)}
                className={cn(
                  ctaClass("outline-dark", "md"),
                  "w-full justify-center text-rose-700 hover:text-rose-800 hover:border-rose-300 hover:bg-rose-50 cursor-pointer"
                )}
              >
                <XCircle className="size-4 mr-1" />
                <span>Simulate Payment Failure (Card Decline)</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 text-xs text-stone hover:text-ink transition-colors cursor-pointer"
              >
                Cancel and Return to Account
              </button>
            </div>
          </div>
        )}

        {checkoutStep === "processing" && (
          <div className="py-12 text-center space-y-4">
            <div className="inline-grid size-14 place-items-center rounded-full bg-champagne/15 text-champagne-dark mx-auto animate-spin">
              <RefreshCw className="size-6" />
            </div>
            <h3 className="font-display text-xl text-ink font-normal">
              Processing Payment &amp; Provisioning Modules…
            </h3>
            <p className="text-xs text-stone max-w-sm mx-auto">
              Contacting the platform billing engine and updating module entitlements for your workspace.
            </p>
          </div>
        )}

        {checkoutStep === "failed" && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-200">
                <XCircle className="size-6" />
              </span>
              <div>
                <h3 className="font-display text-2xl text-ink font-normal">
                  Payment Authorization Failed
                </h3>
                <p className="text-xs text-stone mt-1">
                  The simulated payment was declined. Your account remains inactive.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-xs text-rose-800">
              {paymentErrorMessage}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setCheckoutStep("review")}
                className={cn(ctaClass("gold", "lg"), "w-full justify-center cursor-pointer")}
              >
                <span>Try Payment Again</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className={cn(ctaClass("outline-dark", "md"), "w-full justify-center cursor-pointer")}
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        )}

        {checkoutStep === "success" && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                <CheckCircle2 className="size-6" />
              </span>
              <div>
                <h3 className="font-display text-2xl text-ink font-normal">
                  Subscription Activated!
                </h3>
                <p className="text-xs text-stone mt-1">
                  Your mock payment succeeded. Module entitlements are now active on your workspace.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Activated Plan:</span>
                <span>{packageInfo.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Active Modules:</span>
                <span>{packageInfo.modules.join(", ")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Evaluation Window:</span>
                <span>{TRIAL_DAYS} Days Free Access</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  router.push("/tenant/dashboard");
                }}
                className={cn(ctaClass("gold", "lg"), "w-full justify-center shadow-lg shadow-champagne/20 cursor-pointer")}
              >
                <span>Enter Workspace Dashboard</span>
                <ArrowRight className="size-4 ml-1" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className={cn(ctaClass("outline-dark", "md"), "w-full justify-center cursor-pointer")}
              >
                <span>Stay in Account Overview</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
