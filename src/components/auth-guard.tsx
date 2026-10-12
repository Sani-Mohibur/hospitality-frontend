"use client";

import { useAuth, Role } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthorized = !isLoading && user && (!allowedRoles || allowedRoles.includes(user.role));

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard based on role
        if (user.role === "SUPER_ADMIN") {
          router.push("/super-admin");
        } else {
          router.push("/account");
        }
      }
    }
  }, [user, isLoading, router, pathname, allowedRoles]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}
