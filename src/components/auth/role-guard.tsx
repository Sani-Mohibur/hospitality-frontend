"use client";

import { useAuth, Role } from "@/lib/auth-context";
import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, hasRole } = useAuth();

  if (!user) {
    return null; // Or a loading spinner
  }

  if (!hasRole(allowedRoles)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="bg-red-50 text-red-500 p-4 rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 max-w-md">
          You do not have the necessary permissions to view this page. If you believe this is an error, please contact your Tenant Owner.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
