"use client";

import React, { useState } from "react";
import { 
  User, 
  Lock, 
  Bell, 
  Settings2, 
  Camera, 
  Save, 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  Mail,
  AlertTriangle
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
import { toast } from "sonner";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Profile State
  const [profile, setProfile] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@hospitalityos.com",
    phone: "+1 (555) 019-2834",
    timezone: "America/New_York",
  });

  // Security State
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true,
  });

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile updated successfully.");
    }, 800);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSecurity(s => ({ ...s, currentPassword: "", newPassword: "", confirmPassword: "" }));
      toast.success("Security settings updated successfully.");
    }, 800);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Preferences saved successfully.");
    }, 800);
  };

  const confirmMaintenanceMode = () => {
    setIsConfirmOpen(false);
    toast.success("Maintenance mode has been enabled. Only Super Admins can log in.");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1 mb-6">Manage your account settings, security preferences, and global platform configurations.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 bg-slate-100/80 p-1.5 rounded-xl gap-1">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="w-4 h-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Lock className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
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
                        {profile.firstName[0]}{profile.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Profile Picture</h3>
                    <p className="text-sm text-slate-500 mb-3">JPG, GIF or PNG. Max size of 2MB.</p>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm">Upload New</Button>
                      <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Remove</Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} required disabled className="bg-slate-50" />
                    <p className="text-xs text-slate-500">Super Admin email cannot be changed here.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Timezone</Label>
                    <Select value={profile.timezone} onValueChange={v => v && setProfile({...profile, timezone: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-4">
              <Button type="submit" form="profile-form" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white ml-auto">
                {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
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
                  <Input id="currentPassword" type="password" value={security.currentPassword} onChange={e => setSecurity({...security, currentPassword: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" value={security.newPassword} onChange={e => setSecurity({...security, newPassword: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" value={security.confirmPassword} onChange={e => setSecurity({...security, confirmPassword: e.target.value})} />
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-4">
              <Button type="submit" form="security-form" disabled={isSaving || !security.currentPassword || !security.newPassword} className="bg-blue-600 hover:bg-blue-700 text-white ml-auto">
                {isSaving ? "Updating..." : "Update Password"}
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
                  <h4 className="text-sm font-semibold text-slate-900">{security.twoFactorEnabled ? "Two-Factor Authentication is Enabled" : "Two-Factor Authentication is Disabled"}</h4>
                  <p className="text-sm text-slate-500 mt-1">We recommend keeping 2FA enabled to secure the Super Admin dashboard.</p>
                </div>
                <Button 
                  variant={security.twoFactorEnabled ? "outline" : "default"} 
                  onClick={() => {
                    setSecurity(s => ({...s, twoFactorEnabled: !s.twoFactorEnabled}));
                    toast.success(`2FA has been ${!security.twoFactorEnabled ? 'enabled' : 'disabled'}.`);
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
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-4">
                  <Monitor className="w-6 h-6 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Windows 11 • Chrome <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded ml-2">Current Session</span></p>
                    <p className="text-xs text-slate-500">New York, USA • 192.168.1.45</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" disabled>Active</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-4">
                  <Smartphone className="w-6 h-6 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">iPhone 14 Pro • Safari</p>
                    <p className="text-xs text-slate-500">New York, USA • 172.16.254.1 (Last active 2 hours ago)</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Revoke</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 outline-none">
          <form onSubmit={handleSavePreferences}>
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
                    <Checkbox id="notif-tenants" checked={notifications.newTenants} onCheckedChange={(c) => setNotifications(n => ({...n, newTenants: !!c}))} />
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <div>
                      <Label htmlFor="notif-billing" className="font-medium cursor-pointer">Billing Alerts</Label>
                      <p className="text-sm text-slate-500">Receive alerts for overdue subscriptions and high-value payments.</p>
                    </div>
                    <Checkbox id="notif-billing" checked={notifications.billingAlerts} onCheckedChange={(c) => setNotifications(n => ({...n, billingAlerts: !!c}))} />
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <div>
                      <Label htmlFor="notif-errors" className="font-medium cursor-pointer">Critical System Errors</Label>
                      <p className="text-sm text-slate-500">Get notified immediately if a core platform service fails.</p>
                    </div>
                    <Checkbox id="notif-errors" checked={notifications.systemErrors} onCheckedChange={(c) => setNotifications(n => ({...n, systemErrors: !!c}))} />
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <div>
                      <Label htmlFor="notif-marketing" className="font-medium cursor-pointer">Product & Marketing Updates</Label>
                      <p className="text-sm text-slate-500">Receive newsletters regarding new features and SaaS updates.</p>
                    </div>
                    <Checkbox id="notif-marketing" checked={notifications.marketingUpdates} onCheckedChange={(c) => setNotifications(n => ({...n, marketingUpdates: !!c}))} />
                  </div>
                </div>

                <div className="border-t border-slate-100 my-2 pt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Bell className="w-4 h-4 text-slate-400" /> In-App Notifications</h3>
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <div>
                      <Label htmlFor="notif-push" className="font-medium cursor-pointer">Push Notifications</Label>
                      <p className="text-sm text-slate-500">Allow real-time push alerts to appear in your browser dashboard.</p>
                    </div>
                    <Checkbox id="notif-push" checked={notifications.pushEnabled} onCheckedChange={(c) => setNotifications(n => ({...n, pushEnabled: !!c}))} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-4">
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white ml-auto">
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6 outline-none">
          <form onSubmit={handleSavePreferences}>
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>Manage global defaults and system-wide behaviors for the SaaS platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Default System Currency</Label>
                    <Select value={system.defaultCurrency} onValueChange={(v) => v && setSystem(s => ({...s, defaultCurrency: v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                        <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                        <SelectItem value="PKR">PKR (₨) - Pakistani Rupee</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">Base currency for global analytics.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Global Session Timeout (Minutes)</Label>
                    <Select value={system.sessionTimeout} onValueChange={(v) => v && setSystem(s => ({...s, sessionTimeout: v}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 Minutes</SelectItem>
                        <SelectItem value="30">30 Minutes</SelectItem>
                        <SelectItem value="60">1 Hour</SelectItem>
                        <SelectItem value="1440">24 Hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">Auto-logout time for inactivity across all tenants.</p>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="supportEmail">Global Support Email Address</Label>
                    <Input id="supportEmail" type="email" value={system.supportEmail} onChange={e => setSystem({...system, supportEmail: e.target.value})} />
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
                        <p className="text-sm text-rose-700 mt-1 mb-3">Enabling this prevents all non-admin users from logging in. Active user sessions will be forcefully terminated.</p>
                        <Button 
                          type="button" 
                          variant={system.maintenanceMode ? "outline" : "destructive"} 
                          size="sm"
                          className={system.maintenanceMode ? "border-rose-300 text-rose-700 bg-white hover:bg-rose-100" : ""}
                          onClick={() => {
                            if (system.maintenanceMode) {
                              setSystem(s => ({...s, maintenanceMode: false}));
                              toast.success("Maintenance mode disabled. Tenants can now log in.");
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
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white ml-auto">
                  {isSaving ? "Saving..." : "Save System Config"}
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
              Are you sure you want to enable Maintenance Mode? This will instantly log out all active tenants and their staff, preventing any further logins until you disable it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setSystem(s => ({...s, maintenanceMode: true}));
                confirmMaintenanceMode();
              }}
            >
              Enable Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
