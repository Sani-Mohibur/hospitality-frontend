"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
  { name: "Tenants", href: "/super-admin/tenants", icon: Users },
  { name: "Subscriptions", href: "/super-admin/subscriptions", icon: CreditCard },
  { name: "Platform Modules", href: "/super-admin/platform-modules", icon: Package },
  { name: "Audit Logs", href: "/super-admin/audit-logs", icon: FileText },
  { name: "Settings", href: "/super-admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return "SA";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const isActive = (href: string) => {
    if (href === "/super-admin") return pathname === "/super-admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-[#1e58d4] text-white flex flex-col h-full shadow-lg shrink-0">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold">Hospitality OS</h2>
        <p className="text-xs text-blue-200 mt-1">Super Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active
                  ? "bg-white/20 font-semibold text-white shadow-sm"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-9 h-9 border border-white/20 shrink-0">
              <AvatarFallback className="bg-blue-800 text-white font-bold text-xs">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-white">{user?.name || "Super Admin"}</p>
              <p className="text-[11px] text-blue-200 truncate">{user?.email || "admin@hospitality.com"}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign out"
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
