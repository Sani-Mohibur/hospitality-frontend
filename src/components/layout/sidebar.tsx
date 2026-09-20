import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  FileText,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
  { name: "Tenants", href: "/super-admin/tenants", icon: Users },
  { name: "Subscriptions", href: "/super-admin/subscriptions", icon: CreditCard },
  { name: "Platform Modules", href: "/super-admin/platform-modules", icon: Package },
  { name: "Audit Logs", href: "/super-admin/audit-logs", icon: FileText },
  { name: "Settings", href: "/super-admin/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#1e58d4] text-white flex flex-col h-full shadow-lg">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold">Hospitality OS</h2>
        <p className="text-xs text-blue-200 mt-1">Super Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/10 ${item.name === "Dashboard" ? "bg-white/15 font-medium" : "text-blue-100"
              }`}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-xl cursor-pointer transition-colors">
          <Avatar className="w-10 h-10 border border-white/20">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-blue-200 truncate">admin@hospitality.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
