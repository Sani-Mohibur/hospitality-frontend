"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { User, Mail, Phone, Shield, Building, Save, Loader2, CheckCircle2 } from "lucide-react";

export default function TenantProfilePage() {
  const { user, tenant, refreshUser, isLoading: isAuthLoading } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const getInitials = (userName?: string) => {
    if (!userName) return "U";
    const parts = userName.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : userName.slice(0, 2).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await apiClient.patch("/user/update-profile", {
        name: name.trim(),
        phone: phone.trim(),
      });
      await refreshUser();
      setSavedSuccess(true);
      toast.success("Profile updated successfully");
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Profile</h1>
        <p className="text-sm text-slate-500">
          Manage your personal information and contact preferences.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1 border-slate-200 shadow-sm">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="w-20 h-20 border-2 border-slate-200 mb-4 shadow-sm">
              <AvatarFallback className="bg-slate-900 text-white font-bold text-xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-bold text-slate-900 truncate w-full">{user.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5 truncate w-full">{user.email}</p>

            <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-xs">
                {user.role?.replace("_", " ")}
              </Badge>
              {user.isActive !== false ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">Active</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Inactive</Badge>
              )}
            </div>

            <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3 text-left text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">
                  <strong className="text-slate-800">Workspace:</strong> {tenant?.name || "Standard Workspace"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">
                  <strong className="text-slate-800">Security:</strong> Role Authenticated
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Information Form */}
        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Personal Details</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Update your display name and contact phone number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-slate-50 text-slate-500 cursor-not-allowed text-sm"
                />
                <p className="text-[11px] text-slate-400">
                  Email address is linked to your authentication login and cannot be altered directly.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 012-3456"
                  className="text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {savedSuccess ? (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Changes saved
                  </span>
                ) : (
                  <span />
                )}

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
