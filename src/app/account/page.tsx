"use client";

import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { LogOut, ArrowRight, Building, CheckCircle2, XCircle } from "lucide-react";

export default function AccountPage() {
  const { user, tenant, logout, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading || !user) return null;

  const isTenantUser = user.role !== "SUPER_ADMIN";
  const hasActiveAccess = tenant?.status === "ACTIVE" || tenant?.status === "TRIALING";

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Account</h1>
              <p className="text-slate-500 mt-1">Manage your profile and access</p>
            </div>
            <Button variant="outline" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* User Profile Summary */}
            <Card className="md:col-span-1 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Profile Details</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-slate-500">Name</div>
                  <div className="text-base font-semibold">{user.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Email</div>
                  <div className="text-base">{user.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Role</div>
                  <Badge variant="secondary" className="mt-1">
                    {user.role ? user.role.replace("_", " ") : "USER"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tenant & Subscription Details */}
            {isTenantUser && tenant && (
              <Card className="md:col-span-2 shadow-sm border-slate-200 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-slate-500" />
                      Workspace: {tenant.name}
                    </div>
                    {tenant.status === "ACTIVE" && <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>}
                    {tenant.status === "TRIALING" && <Badge className="bg-blue-500 hover:bg-blue-600">Trialing</Badge>}
                    {(tenant.status === "SUSPENDED" || tenant.status === "PAST_DUE") && <Badge variant="destructive">Suspended</Badge>}
                    {tenant.status === "CANCELLED" && <Badge variant="secondary">Cancelled</Badge>}
                  </CardTitle>
                  <CardDescription>
                    Your current subscription and module access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 flex-1">
                  
                  {/* Subscription Info */}
                  <div className="rounded-lg bg-slate-100 p-4 border border-slate-200">
                    <h3 className="font-semibold text-sm mb-3 text-slate-700">Plan Details</h3>
                    {tenant.subscription ? (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="block text-slate-500">Current Plan</span>
                          <span className="font-medium">{tenant.subscription.planName}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500">Next Billing Date</span>
                          <span className="font-medium">
                            {new Date(tenant.subscription.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 italic">No active subscription plan found.</div>
                    )}
                  </div>

                  {/* Modules */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3 text-slate-700">Module Access</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { code: "HOSPITALITY" as const, label: "Hospitality / Hotel" },
                        { code: "RESTAURANT" as const, label: "Restaurant / POS" },
                        { code: "INVENTORY" as const, label: "Recipe & Inventory" },
                        { code: "DISTRIBUTION" as const, label: "Channel Distribution" },
                        { code: "AI_ASSISTANT" as const, label: "AI Operations Assistant" },
                      ].map((m) => {
                        const hasMod = tenant.subscribedModules.includes(m.code);
                        return (
                          <div key={m.code} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white">
                            {hasMod ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-slate-300 shrink-0" />
                            )}
                            <span className={`text-sm font-medium ${hasMod ? "text-slate-900" : "text-slate-400"}`}>
                              {m.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {!hasActiveAccess && (
                    <div className="flex gap-3 p-4 bg-red-50 text-red-900 rounded-lg border border-red-100 text-sm">
                      <XCircle className="w-5 h-5 shrink-0 text-red-500" />
                      <div>
                        <p className="font-semibold">Workspace Access Suspended</p>
                        <p className="mt-1 opacity-90">Your subscription is inactive or suspended. Please contact your administrator or update your billing details to restore access.</p>
                      </div>
                    </div>
                  )}

                </CardContent>
                <CardFooter className="pt-2 border-t border-slate-100 bg-slate-50/50 mt-auto flex flex-col sm:flex-row gap-2">
                  {user.role === "TENANT_OWNER" && (
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => router.push("/tenant/settings/subscription")}
                    >
                      Manage Subscription
                    </Button>
                  )}
                  <Button 
                    className="w-full sm:flex-1 gap-2" 
                    size="lg"
                    disabled={!hasActiveAccess}
                    onClick={() => router.push("/tenant/dashboard")}
                  >
                    Enter Workspace
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Super Admin */}
            {!isTenantUser && (
              <Card className="md:col-span-2 shadow-sm border-slate-200 flex flex-col justify-center items-center p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Building className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Super Admin Access</h3>
                <p className="text-slate-500 mb-6 max-w-md">You have platform-wide administrative privileges.</p>
                <Button size="lg" onClick={() => router.push("/super-admin")}>
                  Enter Super Admin Panel
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
