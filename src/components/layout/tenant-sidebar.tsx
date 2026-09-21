"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bed,
  Calendar,
  Users,
  FileText,
  Settings,
  Utensils,
  MonitorPlay,
  Package,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, Role, Module } from "@/lib/auth-context";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  allowedRoles?: Role[];
};

type NavGroup = {
  title: string;
  module?: Module;
  allowedRoles?: Role[];
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    allowedRoles: ["TENANT_OWNER", "TENANT_MANAGER"],
    items: [
      { name: "Dashboard", href: "/tenant/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Hospitality",
    module: "HOSPITALITY",
    items: [
      { name: "Room Board", href: "/tenant/hospitality/rooms", icon: Bed },
      { name: "Reservations", href: "/tenant/hospitality/reservations", icon: Calendar },
      { name: "Guests", href: "/tenant/hospitality/guests", icon: Users },
      { name: "Folios", href: "/tenant/hospitality/folios", icon: FileText },
      { name: "Config", href: "/tenant/hospitality/config", icon: Settings, allowedRoles: ["TENANT_OWNER", "TENANT_MANAGER"] },
    ],
  },
  {
    title: "Restaurant",
    module: "RESTAURANT",
    items: [
      { name: "POS / Menu", href: "/tenant/restaurant/pos", icon: Utensils },
      { name: "Tables", href: "/tenant/restaurant/tables", icon: LayoutDashboard },
      { name: "KDS", href: "/tenant/restaurant/kds", icon: MonitorPlay },
      { name: "Config", href: "/tenant/restaurant/config", icon: Settings, allowedRoles: ["TENANT_OWNER", "TENANT_MANAGER"] },
    ],
  },
  {
    title: "Shared & Settings",
    items: [
      { name: "Inventory", href: "/tenant/inventory", icon: Package },
      { name: "Staff", href: "/tenant/settings/staff", icon: Users, allowedRoles: ["TENANT_OWNER", "TENANT_MANAGER"] },
      { name: "Audit Logs", href: "/tenant/settings/audit-logs", icon: ClipboardList, allowedRoles: ["TENANT_OWNER", "TENANT_MANAGER"] },
      { name: "Subscription", href: "/tenant/settings/subscription", icon: CreditCard, allowedRoles: ["TENANT_OWNER"] },
    ],
  },
];

export function TenantSidebar() {
  const pathname = usePathname();
  const { user, hasRole, hasModule } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-lg overflow-y-auto">
      <div className="p-6 border-b border-white/10 shrink-0">
        <h2 className="text-xl font-bold">Tenant Name</h2>
        <p className="text-xs text-slate-400 mt-1">Tenant Dashboard</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-6">
        {navGroups
          .filter((group) => {
            if (group.module && !hasModule(group.module)) return false;
            if (group.allowedRoles && !hasRole(group.allowedRoles)) return false;
            return true;
          })
          .map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (item.allowedRoles && !hasRole(item.allowedRoles)) return false;
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title}>
                <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                          isActive
                            ? "bg-white/15 text-white font-medium"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-xl cursor-pointer transition-colors">
          <Avatar className="w-10 h-10 border border-white/20">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
