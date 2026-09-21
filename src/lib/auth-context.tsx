"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role = "TENANT_OWNER" | "TENANT_MANAGER" | "STAFF";
export type Module = "HOSPITALITY" | "RESTAURANT";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface Tenant {
  id: string;
  name: string;
  subscribedModules: Module[];
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  setUserRole: (role: Role) => void;
  toggleModule: (module: Module) => void;
  hasRole: (allowedRoles: Role[]) => boolean;
  hasModule: (module: Module) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Mock initial state
  const [user, setUser] = useState<User>({
    id: "u-1",
    name: "Tenant User",
    email: "user@tenant.com",
    role: "TENANT_OWNER",
  });

  const [tenant, setTenant] = useState<Tenant>({
    id: "t-1",
    name: "Acme Hospitality",
    subscribedModules: ["HOSPITALITY", "RESTAURANT"],
  });

  const setUserRole = (role: Role) => {
    setUser((prev) => ({ ...prev, role }));
  };

  const toggleModule = (module: Module) => {
    setTenant((prev) => {
      const has = prev.subscribedModules.includes(module);
      return {
        ...prev,
        subscribedModules: has
          ? prev.subscribedModules.filter((m) => m !== module)
          : [...prev.subscribedModules, module],
      };
    });
  };

  const hasRole = (allowedRoles: Role[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const hasModule = (module: Module) => {
    if (!tenant) return false;
    return tenant.subscribedModules.includes(module);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        setUserRole,
        toggleModule,
        hasRole,
        hasModule,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
