"use client";

import { Bell, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, Role } from "@/lib/auth-context";

export function TenantTopbar() {
  const { user, setUserRole, toggleModule, hasModule } = useAuth();
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gray-500" />
        <Select defaultValue="loc-1">
          <SelectTrigger className="w-[200px] border-none shadow-none font-medium bg-gray-50 focus:ring-0">
            <SelectValue placeholder="Select Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="loc-1">Main Hotel & Resort</SelectItem>
            <SelectItem value="loc-2">Downtown Branch</SelectItem>
            <SelectItem value="loc-3">Airport Terminal Lounge</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        {/* DEV ONLY: Role & Module Switcher */}
        <div className="flex items-center gap-2 border-r pr-4 mr-2">
          <Select
            value={user?.role}
            onValueChange={(val) => setUserRole(val as Role)}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs bg-slate-100 border-none">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TENANT_OWNER">Owner</SelectItem>
              <SelectItem value="TENANT_MANAGER">Manager</SelectItem>
              <SelectItem value="STAFF">Staff</SelectItem>
            </SelectContent>
          </Select>
          
          <button 
            onClick={() => toggleModule("HOSPITALITY")}
            className={`px-2 py-1 text-xs rounded ${hasModule("HOSPITALITY") ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}
          >
            Hosp
          </button>
          <button 
            onClick={() => toggleModule("RESTAURANT")}
            className={`px-2 py-1 text-xs rounded ${hasModule("RESTAURANT") ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}
          >
            Rest
          </button>
        </div>

        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <Avatar className="w-8 h-8 cursor-pointer border border-gray-200">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>TU</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
