"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiFetch } from "./api";

export type Role = "SUPER_ADMIN" | "TENANT_OWNER" | "TENANT_MANAGER" | "STAFF";
export type Module = "HOSPITALITY" | "RESTAURANT" | "INVENTORY" | "DISTRIBUTION" | "AI_ASSISTANT";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions?: string[];
  impersonatedBy?: string;
  tenantId?: string;
}

interface Subscription {
  id: string;
  planName: string;
  status: string;
  currentPeriodEnd: string;
}

interface Tenant {
  id: string;
  name: string;
  status: string;
  subscribedModules: Module[];
  subscription: Subscription | null;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  setUserRole: (role: Role) => void;
  toggleModule: (module: Module) => void;
  hasRole: (allowedRoles: Role[]) => boolean;
  hasModule: (module: Module) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const res = await apiFetch("/user/me");
          if (res.ok) {
            const data = await res.json();
            setUser(data.data as User);
            if (data.data.tenant) {
              setTenant(data.data.tenant as Tenant);
            }
          } else {
            localStorage.removeItem("accessToken");
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("accessToken", token);
    setUser(userData);
    // Usually, login returns the user with tenant. We can fetch /user/me or assume it's set.
    // For simplicity, we just set the user for now. A reload or a subsequent state update will sync.
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST", requireAuth: false });
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      setTenant(null);
      window.location.href = "/login";
    }
  };

  const setUserRole = (role: Role) => {
    if (user) setUser({ ...user, role });
  };

  const toggleModule = (module: Module) => {
    if (tenant) {
      const has = tenant.subscribedModules.includes(module);
      setTenant({
        ...tenant,
        subscribedModules: has
          ? tenant.subscribedModules.filter((m) => m !== module)
          : [...tenant.subscribedModules, module],
      });
    }
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
        isLoading,
        login,
        logout,
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
