"use client";

import { useAuth, Module } from "@/lib/auth-context";
import { PackageX } from "lucide-react";
import { ReactNode } from "react";

interface ModuleGuardProps {
  module: Module;
  children: ReactNode;
}

export function ModuleGuard({ module, children }: ModuleGuardProps) {
  const { tenant, hasModule } = useAuth();

  if (!tenant) {
    return null;
  }

  if (!hasModule(module)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="bg-slate-100 text-slate-400 p-4 rounded-full">
          <PackageX className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Module Not Subscribed</h2>
        <p className="text-slate-500 max-w-md">
          Your organization is not currently subscribed to the {module} module. 
          Please contact support or upgrade your subscription to access these features.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
