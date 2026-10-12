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

  const hasActiveAccess = tenant.status === "ACTIVE" || tenant.status === "TRIALING";

  if (!hasActiveAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-8 text-center space-y-6">
        <div className="bg-red-50 text-red-500 p-6 rounded-full">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Workspace Access Suspended</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Your workspace subscription is currently <strong>{tenant.status.toLowerCase().replace("_", " ")}</strong>. You must have an active subscription or trial to access operational features.
          </p>
        </div>
        <Button onClick={() => router.push("/account")} variant="outline">
          Return to Account
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
