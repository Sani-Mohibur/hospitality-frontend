"use client";

import { useAuth } from "@/lib/auth-context";
import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SubscriptionGuardProps {
  children: ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { tenant } = useAuth();
  const router = useRouter();

  if (!tenant) return null;

  const hasActiveModules = Array.isArray(tenant.subscribedModules) && tenant.subscribedModules.length > 0;
  const isGoodStatus = tenant.status === "ACTIVE" || tenant.status === "TRIALING";
  const hasActiveAccess = isGoodStatus && hasActiveModules;

  if (!hasActiveAccess) {
    const isUnsubscribed = !hasActiveModules;
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-8 text-center space-y-6">
        <div className={`p-6 rounded-full ${isUnsubscribed ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'}`}>
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">
            {isUnsubscribed ? "Subscription Required" : "Workspace Access Suspended"}
          </h2>
          <p className="text-slate-500 max-w-md mx-auto">
            {isUnsubscribed
              ? "You have not activated any operational modules for this workspace yet. Please choose a subscription plan to access the operational console."
              : `Your workspace subscription is currently ${tenant.status.toLowerCase().replace("_", " ")}. You must have an active subscription or trial to access operational features.`}
          </p>
        </div>
        <Button onClick={() => router.push("/account")} className="bg-slate-900 text-white hover:bg-slate-800">
          {isUnsubscribed ? "View Plans & Activate Workspace" : "Return to Account"}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
