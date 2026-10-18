"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Building2,
  User as UserIcon,
  LogOut,
  ChevronUp,
  ChevronDown,
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
  collapsible?: boolean;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    allowedRoles: ["TENANT_OWNER", "TENANT_MANAGER"],
    collapsible: false,
    items: [
      { name: "Dashboard", href: "/tenant/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Hospitality",
    module: "HOSPITALITY",
    collapsible: true,
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
    collapsible: true,
    items: [
      { name: "POS / Menu", href: "/tenant/restaurant/pos", icon: Utensils },
      { name: "Tables", href: "/tenant/restaurant/tables", icon: LayoutDashboard },
      { name: "KDS", href: "/tenant/restaurant/kds", icon: MonitorPlay },
      { name: "Config", href: "/tenant/restaurant/config", icon: Settings, allowedRoles: ["TENANT_OWNER", "TENANT_MANAGER"] },
    ],
  },
  {
    title: "Shared & Settings",
    collapsible: true,
    allowedRoles: ["TENANT_OWNER", "TENANT_MANAGER"],
    items: [
      { name: "Inventory", href: "/tenant/inventory", icon: Package },
      { name: "Staff", href: "/tenant/settings/staff", icon: Users, allowedRoles: ["TENANT_OWNER", "TENANT_MANAGER"] },
      { name: "Audit Logs", href: "/tenant/settings/audit-logs", icon: ClipboardList, allowedRoles: ["TENANT_OWNER", "TENANT_MANAGER"] },
    ],
  },
];

const isGroupActive = (group: NavGroup, currentPath: string) => {
  return group.items.some(
    (item) => currentPath === item.href || currentPath.startsWith(item.href + "/")
  );
};

export function TenantSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, tenant, hasRole, hasModule, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Section collapsible state with sensible defaults based on active route
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      Hospitality: true,
      Restaurant: false,
      "Shared & Settings": false,
    };
    navGroups.forEach((group) => {
      if (group.collapsible && isGroupActive(group, pathname)) {
        initial[group.title] = true;
      }
    });
    return initial;
  });

  // Automatically expand group when navigating to one of its child routes
  useEffect(() => {
    navGroups.forEach((group) => {
      if (group.collapsible && isGroupActive(group, pathname)) {
        setOpenSections((prev) => {
          if (prev[group.title]) return prev;
          return { ...prev, [group.title]: true };
        });
      }
    });
  }, [pathname]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  const getInitials = (name?: string) => {
    if (!name) return "TU";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  if (!user) return null;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-lg overflow-hidden shrink-0">
      <div className="p-6 border-b border-white/10 shrink-0">
        <h2 className="text-xl font-bold truncate" title={tenant?.name || "Workspace"}>
          {tenant?.name || "Workspace"}
        </h2>
        <p className="text-xs text-slate-400 mt-1">Operations Console</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
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

            const isCollapsible = !!group.collapsible;
            const isExpanded = isCollapsible ? !!openSections[group.title] : true;

            return (
              <div key={group.title} className="space-y-1">
                {isCollapsible ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(group.title)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-left rounded-lg hover:bg-white/5"
                    aria-expanded={isExpanded}
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>
                ) : (
                  <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {group.title}
                  </h3>
                )}

                {isCollapsible ? (
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${
                      isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-1 pt-1">
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
                  </div>
                ) : (
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
                )}
              </div>
            );
          })}
      </nav>

      <div ref={profileRef} className="p-3 mt-auto border-t border-white/10 shrink-0 bg-slate-900">
        {/* Inline Collapsible Dropup Menu (opens upward) */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${
            isProfileOpen ? "grid-rows-[1fr] opacity-100 mb-2" : "grid-rows-[0fr] opacity-0 mb-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="p-2 bg-slate-800/95 border border-white/10 rounded-xl shadow-lg space-y-1">
              <div className="px-2.5 py-2 border-b border-white/10 flex items-center gap-2.5">
                <Avatar className="w-8 h-8 border border-white/20 shrink-0">
                  {user.profileImage?.url && (
                    <AvatarImage src={user.profileImage.url} alt={user.name} />
                  )}
                  <AvatarFallback className="bg-slate-800 text-white font-bold text-[10px]">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email || ""}</p>
                  <span className="inline-block text-[10px] text-blue-400 font-semibold tracking-wider uppercase mt-0.5">
                    {user.role?.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="pt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/tenant/settings/profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Profile</span>
                </button>

                {hasRole(["TENANT_OWNER", "SUPER_ADMIN"]) && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push("/account");
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push("/tenant/settings/subscription");
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Subscription & Billing</span>
                    </button>
                  </>
                )}

                <div className="my-1 border-t border-white/10" />

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Card Trigger */}
        <button
          type="button"
          onClick={() => setIsProfileOpen((prev) => !prev)}
          className={`w-full flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors text-left outline-none ${
            isProfileOpen ? "bg-white/15 text-white" : "hover:bg-white/10 text-white"
          }`}
          aria-expanded={isProfileOpen}
          aria-label="User profile menu"
        >
          <Avatar className="w-9 h-9 border border-white/20 shrink-0">
            {user.profileImage?.url && (
              <AvatarImage src={user.profileImage.url} alt={user.name} />
            )}
            <AvatarFallback className="bg-slate-800 text-white font-bold text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white">{user.name}</p>
            <p className="text-xs text-slate-400 truncate capitalize">
              {user.role?.toLowerCase().replace("_", " ")}
            </p>
          </div>
          <ChevronUp
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
              isProfileOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
