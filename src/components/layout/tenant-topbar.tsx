"use client";

import { Bell, MapPin, LogOut, User as UserIcon, Building2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "@/lib/location-context";
import { useRouter } from "next/navigation";

export function TenantTopbar() {
  const { user, logout, tenant } = useAuth();
  const { locations, currentLocation, setCurrentLocation, isLoadingLocations } = useLocation();
  const router = useRouter();

  const getInitials = (name?: string) => {
    if (!name) return "TU";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <MapPin className="w-4 h-4 text-blue-600" />
          {isLoadingLocations ? (
            <span className="text-xs text-slate-400">Loading branches...</span>
          ) : locations.length > 0 ? (
            <Select
              value={currentLocation?._id || ""}
              onValueChange={(val) => {
                const found = locations.find((l) => l._id === val);
                if (found) setCurrentLocation(found);
              }}
            >
              <SelectTrigger className="w-[200px] border-none shadow-none font-medium bg-transparent focus:ring-0 h-auto p-0 text-slate-800 text-sm">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc._id} value={loc._id} className="cursor-pointer">
                    {loc.name} {loc.code ? `(${loc.code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-slate-500 font-medium">Default Location</span>
          )}
        </div>

        {currentLocation?.businessDate && (
          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
            Date: {currentLocation.businessDate}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button 
          title="Notifications" 
          onClick={() => router.push("/tenant/settings/audit-logs")}
          className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
            <Avatar className="w-9 h-9 border border-slate-200">
              <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-slate-900">{user?.name || "Staff User"}</p>
                <p className="text-xs leading-none text-slate-500">{user?.email || ""}</p>
                <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase mt-1">
                  {user?.role?.replace("_", " ")}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => router.push("/account")}
              className="cursor-pointer"
            >
              <Building2 className="w-4 h-4 mr-2 text-slate-500" />
              Account & Workspace
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push("/tenant/settings/staff")}
              className="cursor-pointer"
            >
              <UserIcon className="w-4 h-4 mr-2 text-slate-500" />
              Team & Staff
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
