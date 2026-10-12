"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User as UserIcon,
  Lock,
  Bell,
  Settings2,
  Camera,
  Save,
  ShieldCheck,
  Smartphone,
  Monitor,
  Mail,
  AlertTriangle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { apiClient } from "@/lib/api-client";

interface UserSession {
  _id: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  lastUsedAt?: string;
}

interface PlatformSettingsData {
  defaultCurrency: string;
  sessionTimeout: string;
  supportEmail: string;
  maintenanceMode: boolean;
  notifications: {
    newTenants: boolean;
    billingAlerts: boolean;
    systemErrors: boolean;
    marketingUpdates: boolean;
    pushEnabled: boolean;
  };
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isSavingSystem, setIsSavingSystem] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Profile State
  const [profile, setProfile] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@hospitality.com",
    phone: "",
    timezone: "America/New_York",
  });

  // Security State
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  });

  // Sessions State
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  // Notification State
  const [notifications, setNotifications] = useState({
    newTenants: true,
    billingAlerts: true,
    systemErrors: true,
    marketingUpdates: false,
    pushEnabled: true,
  });

  // System State
  const [system, setSystem] = useState({
    maintenanceMode: false,
    defaultCurrency: "USD",
    supportEmail: "support@hospitalityos.com",
    sessionTimeout: "60",
  });

  const loadAllSettings = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch User Profile
      const userRes = await apiClient.get<any>("/user/me").catch(() => null);
      if (userRes?.data) {
        const u = userRes.data;
        const parts = (u.name || "").trim().split(" ");
        const first = parts[0] || "Admin";
        const last = parts.slice(1).join(" ") || "User";
        setProfile({
          firstName: first,
          lastName: last,
          email: u.email || "",
          phone: u.phone || "",
          timezone: "America/New_York",
        });
        setSecurity((s) => ({ ...s, twoFactorEnabled: !!u.mfa?.enabled }));
      }

      // 2. Fetch Platform Settings
      const settingsRes = await apiClient.get<PlatformSettingsData>("/super-admin/settings").catch(() => null);
      if (settingsRes?.data) {
        const s = settingsRes.data;
        setSystem({
          maintenanceMode: !!s.maintenanceMode,
          defaultCurrency: s.defaultCurrency || "USD",
          supportEmail: s.supportEmail || "support@hospitalityos.com",
          sessionTimeout: s.sessionTimeout || "60",
        });
        if (s.notifications) {
          setNotifications({
            newTenants: !!s.notifications.newTenants,
            billingAlerts: !!s.notifications.billingAlerts,
            systemErrors: !!s.notifications.systemErrors,
            marketingUpdates: !!s.notifications.marketingUpdates,
            pushEnabled: !!s.notifications.pushEnabled,
          });
        }
      }

      // 3. Fetch Active Sessions
      const sessionsRes = await apiClient.get<UserSession[]>("/auth/sessions").catch(() => null);
      if (sessionsRes?.data && Array.isArray(sessionsRes.data)) {
        setSessions(sessionsRes.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();
      await apiClient.patch("/user/update-profile", {
        name: fullName,
        phone: profile.phone,
      });
      await refreshUser();
      toast.success("Profile updated successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (security.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    setIsSavingSecurity(true);
    try {
      await apiClient.post("/auth/change-password", {
        oldPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      setSecurity((s) => ({ ...s, currentPassword: "", newPassword: "", confirmPassword: "" }));
      toast.success("Password changed successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      toast.error(msg);
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      toast.success("Session revoked successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to revoke session";
      toast.error(msg);
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotifications(true);
    try {
      await apiClient.patch("/super-admin/settings", {
        notifications,
      });
      toast.success("Notification preferences saved successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save notifications";
      toast.error(msg);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSystem(true);
    try {
      await apiClient.patch("/super-admin/settings", {
        defaultCurrency: system.defaultCurrency,
        sessionTimeout: system.sessionTimeout,
        supportEmail: system.supportEmail,
        maintenanceMode: system.maintenanceMode,
      });
      toast.success("Platform configuration saved successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save system config";
      toast.error(msg);
    } finally {
      setIsSavingSystem(false);
    }
  };

  const confirmMaintenanceMode = async () => {
    setIsConfirmOpen(false);
    try {
      await apiClient.patch("/super-admin/settings", {
        maintenanceMode: true,
      });
      setSystem((s) => ({ ...s, maintenanceMode: true }));
      toast.success("Maintenance mode has been enabled. Only Super Admins can log in.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to enable maintenance mode";
      toast.error(msg);
    }
  };

  const disableMaintenanceMode = async () => {
    try {
      await apiClient.patch("/super-admin/settings", {
        maintenanceMode: false,
      });
      setSystem((s) => ({ ...s, maintenanceMode: false }));
      toast.success("Maintenance mode disabled. Tenants can now log in.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to disable maintenance mode";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account settings, security preferences, and global platform configurations.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAllSettings}
          disabled={loading}
          className="gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 bg-slate-100/80 p-1.5 rounded-xl gap-1">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">
            <UserIcon className="w-4 h-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">
            <Lock className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">
            <Settings2 className="w-4 h-4 mr-2" /> System Config
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 outline-none">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>This information will be displayed on your dashboard and audit logs.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative group cursor-pointer">
                    <Avatar className="w-24 h-24 border-2 border-white shadow-md">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-semibold">
                        {(profile.firstName[0] || "A").toUpperCase()}{(profile.lastName[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{profile.firstName} {profile.lastName}</h3>
                    <p className="text-sm text-slate-500 mb-3">Super Administrator Account</p>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium border border-slate-200">
                      Role: SUPER_ADMIN
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-slate-50 text-slate-500"
                    />
                    <p className="text-xs text-slate-500">Super Admin email cannot be changed here.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 000-0000"
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Timezone</Label>
                    <Select value={profile.timezone} onValueChange={v => v && setProfile({ ...profile, timezone: v })}>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select Timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York" className="cursor-pointer">Eastern Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Chicago" className="cursor-pointer">Central Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Denver" className="cursor-pointer">Mountain Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Los_Angeles" className="cursor-pointer">Pacific Time (US & Canada)</SelectItem>
                        <SelectItem value="Europe/London" className="cursor-pointer">London (GMT)</SelectItem>
                        <SelectItem value="UTC" className="cursor-pointer">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-4">
              <Button
                type="submit"
                form="profile-form"
                disabled={isSavingProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white ml-auto cursor-pointer"
              >
                {isSavingProfile ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Profile</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 outline-none">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="security-form" onSubmit={handleSaveSecurity} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={security.currentPassword}
                    onChange={e => setSecurity({ ...security, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={security.newPassword}
                    onChange={e => setSecurity({ ...security, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={security.confirmPassword}
                    onChange={e => setSecurity({ ...security, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-4">
              <Button
                type="submit"
                form="security-form"
                disabled={isSavingSecurity || !security.currentPassword || !security.newPassword}
                className="bg-blue-600 hover:bg-blue-700 text-white ml-auto cursor-pointer"
              >
                {isSavingSecurity ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                ) : (
                  "Update Password"
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${security.twoFactorEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-900">
                    {security.twoFactorEnabled ? "Two-Factor Authentication is Enabled" : "Two-Factor Authentication is Disabled"}
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">We recommend keeping 2FA enabled to protect platform administrative access.</p>
                </div>
                <Button
                  variant={security.twoFactorEnabled ? "outline" : "default"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSecurity(s => ({ ...s, twoFactorEnabled: !s.twoFactorEnabled }));
                    toast.info(`MFA setup status: ${!security.twoFactorEnabled ? 'Enabled' : 'Disabled'}.`);
                  }}
                >
                  {security.twoFactorEnabled ? "Disable" : "Enable"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage the devices that are currently logged into your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.length > 0 ? (
                sessions.map((sess, idx) => (
                  <div key={sess._id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-4">
                      {sess.userAgent?.toLowerCase().includes("mobile") ? (
                        <Smartphone className="w-6 h-6 text-slate-400 shrink-0" />
                      ) : (
                        <Monitor className="w-6 h-6 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[280px]">
                            {sess.userAgent?.split(" ")[0] || "Browser Session"}
                          </p>
                          {idx === 0 && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">
                              Current Session
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          IP: {sess.ip || "127.0.0.1"} • Created: {sess.createdAt ? formatDistanceToNow(new Date(sess.createdAt), { addSuffix: true }) : "recently"}
                        </p>
                      </div>
                    </div>
                    {idx === 0 ? (
                      <Button variant="ghost" size="sm" disabled className="text-xs">Active</Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={revokingSessionId === sess._id}
                        onClick={() => handleRevokeSession(sess._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer text-xs"
                      >
                        {revokingSessionId === sess._id ? "Revoking..." : "Revoke"}
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Monitor className="w-6 h-6 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Current Web Session <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded ml-2">Active</span>
                      </p>
                      <p className="text-xs text-slate-500">Connected via browser</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" disabled>Active</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 outline-none">
          <form onSubmit={handleSaveNotifications}>
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what alerts and events you want to be notified about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> Email Notifications</h3>
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <div>
                      <Label htmlFor="notif-tenants" className="font-medium cursor-pointer">New Tenant Onboarding</Label>
                      <p className="text-sm text-slate-500">Receive an email when a new tenant registers or is created.</p>
                    </div>
                    <Checkbox id="notif-tenants" className="cursor-pointer" checked={notifications.newTenants} onCheckedChange={(c) => setNotifications(n => ({ ...n, newTenants: !!c }))} />
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <div>
                      <Label htmlFor="notif-billing" className="font-medium cursor-pointer">Billing Alerts</Label>
                      <p className="text-sm text-slate-500">Receive alerts for overdue subscriptions and high-value payments.</p>
                    </div>
                    <Checkbox id="notif-billing" className="cursor-pointer" checked={notifications.billingAlerts} onCheckedChange={(c) => setNotifications(n => ({ ...n, billingAlerts: !!c }))} />
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <div>
                      <Label htmlFor="notif-errors" className="font-medium cursor-pointer">Critical System Errors</Label>
                      <p className="text-sm text-slate-500">Get notified immediately if a core platform service fails.</p>
                    </div>
                    <Checkbox id="notif-errors" className="cursor-pointer" checked={notifications.systemErrors} onCheckedChange={(c) => setNotifications(n => ({ ...n, systemErrors: !!c }))} />
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <div>
                      <Label htmlFor="notif-marketing" className="font-medium cursor-pointer">Product & Marketing Updates</Label>
                      <p className="text-sm text-slate-500">Receive newsletters regarding new features and SaaS updates.</p>
                    </div>
                    <Checkbox id="notif-marketing" className="cursor-pointer" checked={notifications.marketingUpdates} onCheckedChange={(c) => setNotifications(n => ({ ...n, marketingUpdates: !!c }))} />
                  </div>
                </div>

                <div className="border-t border-slate-100 my-2 pt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Bell className="w-4 h-4 text-slate-400" /> In-App Notifications</h3>
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <div>
                      <Label htmlFor="notif-push" className="font-medium cursor-pointer">Push Notifications</Label>
                      <p className="text-sm text-slate-500">Allow real-time push alerts to appear in your browser dashboard.</p>
                    </div>
                    <Checkbox id="notif-push" className="cursor-pointer" checked={notifications.pushEnabled} onCheckedChange={(c) => setNotifications(n => ({ ...n, pushEnabled: !!c }))} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-4">
                <Button
                  type="submit"
                  disabled={isSavingNotifications}
                  className="bg-blue-600 hover:bg-blue-700 text-white ml-auto cursor-pointer"
                >
                  {isSavingNotifications ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6 outline-none">
          <form onSubmit={handleSaveSystem}>
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>Manage global defaults and system-wide behaviors for the SaaS platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Default System Currency</Label>
                    <Select value={system.defaultCurrency} onValueChange={(v) => v && setSystem(s => ({ ...s, defaultCurrency: v }))}>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD" className="cursor-pointer">USD ($) - US Dollar</SelectItem>
                        <SelectItem value="EUR" className="cursor-pointer">EUR (€) - Euro</SelectItem>
                        <SelectItem value="GBP" className="cursor-pointer">GBP (£) - British Pound</SelectItem>
                        <SelectItem value="PKR" className="cursor-pointer">PKR (₨) - Pakistani Rupee</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">Base currency for global analytics.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Global Session Timeout (Minutes)</Label>
                    <Select value={system.sessionTimeout} onValueChange={(v) => v && setSystem(s => ({ ...s, sessionTimeout: v }))}>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15" className="cursor-pointer">15 Minutes</SelectItem>
                        <SelectItem value="30" className="cursor-pointer">30 Minutes</SelectItem>
                        <SelectItem value="60" className="cursor-pointer">1 Hour</SelectItem>
                        <SelectItem value="1440" className="cursor-pointer">24 Hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">Auto-logout time for inactivity across all tenants.</p>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="supportEmail">Global Support Email Address</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={system.supportEmail}
                      onChange={e => setSystem({ ...system, supportEmail: e.target.value })}
                    />
                    <p className="text-xs text-slate-500">This address receives all tenant support inquiries and billing disputes.</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 my-2 pt-6">
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-rose-900">Maintenance Mode</h4>
                        <p className="text-sm text-rose-700 mt-1 mb-3">
                          {system.maintenanceMode
                            ? "Maintenance mode is CURRENTLY ACTIVE. Only Super Admins can log into the platform."
                            : "Enabling this prevents all non-admin users from logging in. Active user sessions will be restricted."}
                        </p>
                        <Button
                          type="button"
                          variant={system.maintenanceMode ? "outline" : "destructive"}
                          size="sm"
                          className={`cursor-pointer ${system.maintenanceMode ? "border-rose-300 text-rose-700 bg-white hover:bg-rose-100" : ""}`}
                          onClick={() => {
                            if (system.maintenanceMode) {
                              disableMaintenanceMode();
                            } else {
                              setIsConfirmOpen(true);
                            }
                          }}
                        >
                          {system.maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-4">
                <Button
                  type="submit"
                  disabled={isSavingSystem}
                  className="bg-blue-600 hover:bg-blue-700 text-white ml-auto cursor-pointer"
                >
                  {isSavingSystem ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    "Save System Config"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>

      {/* Danger Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Enable Maintenance Mode?
            </DialogTitle>
            <DialogDescription className="mt-2 text-slate-600">
              Are you sure you want to enable Maintenance Mode? This will prevent regular tenant users and staff from logging in until you disable it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={confirmMaintenanceMode}
            >
              Enable Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
