"use client";

import { useRouter } from "next/navigation";
import { Search, Bell, Settings, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return "SA";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-sm shrink-0">
      <div className="w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input 
          placeholder="Search platform resources..." 
          className="pl-9 bg-slate-50 border-slate-200 rounded-xl text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <button 
          title="Notifications"
          className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
            <Avatar className="w-9 h-9 border border-slate-200">
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-slate-900">{user?.name || "Super Admin"}</p>
                <p className="text-xs leading-none text-slate-500">{user?.email || "admin@hospitality.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => router.push("/super-admin/settings")} 
              className="cursor-pointer"
            >
              <Settings className="w-4 h-4 mr-2 text-slate-500" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => logout()}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
