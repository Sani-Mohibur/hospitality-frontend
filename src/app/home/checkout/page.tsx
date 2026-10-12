"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Container, Accent, ctaClass } from "@/components/home/primitives";
import { PACKAGES, getTier, isPackageId, isTierId, isBillingCycle, priceFor, PackageId, TierId, BillingCycle } from "@/lib/marketing/plans";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { Check, ArrowRight, ShieldCheck, Building2, User, Mail, Lock, Phone, AlertCircle, Sparkles, RefreshCw, CreditCard, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OpenInvoice {
  _id: string;
  number: string;
  totalMinor: number;
  currency: string;
  dueDate: string;
  status: string;
}

interface TenantSubscriptionData {
  planName: string;
  status: string;
  billingCycle: "MONTHLY" | "YEARLY";
  monthlyMinor: number;
  cycleAmountMinor: number;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  features: string[];
  openInvoices?: OpenInvoice[];
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, tenant, login, refreshUser } = useAuth();
  
  const pkgParam = searchParams.get("package");
  const tierParam = searchParams.get("tier");
  const cycleParam = searchParams.get("cycle");

  const pkg: PackageId = isPackageId(pkgParam) ? pkgParam : "suite";
  const tier: TierId = isTierId(tierParam) ? tierParam : "professional";
  const [cycle, setCycle] = useState<BillingCycle>(isBillingCycle(cycleParam) ? cycleParam : "annual");

  const packageInfo = PACKAGES[pkg];
  const tierInfo = getTier(pkg, tier);
  const price = tierInfo.monthly !== null ? priceFor(tierInfo.monthly, cycle) : null;

  // Selected modules for this package
  const baseModules = packageInfo.modules;
  const [selectedModules, setSelectedModules] = useState<string[]>(baseModules);

  // Unauthenticated signup form state
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successState, setSuccessState] = useState<{
    message: string;
    trialEndsAt?: string;
  } | null>(null);

  // Authenticated tenant subscription state
  const [tenantSub, setTenantSub] = useState<TenantSubscriptionData | null>(null);
  const [isLoadingTenantSub, setIsLoadingTenantSub] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  useEffect(() => {
    setSelectedModules(packageInfo.modules);
  }, [pkg]);

  // If user is already authenticated with a tenant, fetch their live subscription
  useEffect(() => {
    if (user && tenant) {
      async function fetchTenantSubscription() {
        setIsLoadingTenantSub(true);
        try {
          const res = await apiFetch("/subscription/my-subscription");
          if (res.ok) {
            const data = await res.json();
            if (data.data) {
              setTenantSub(data.data as TenantSubscriptionData);
            }
          }
        } catch (err) {
          console.error("Failed to fetch tenant subscription", err);
        } finally {
          setIsLoadingTenantSub(false);
        }
      }
      fetchTenantSubscription();
    }
  }, [user, tenant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSignupAndStartTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (formData.businessName.trim().length < 2) {
      setErrorMessage("Business name must be at least 2 characters long.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          businessName: formData.businessName.trim(),
          ownerName: formData.ownerName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim() || undefined,
          modules: selectedModules,
        }),
        requireAuth: false,
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrorMessage(resData.message || "Failed to create account. Please try again.");
        return;
      }

      // Success: Log user in and refresh auth state
      const accessToken = resData.data?.accessToken;
      const newUser = resData.data?.user || resData.data;
      if (accessToken && newUser) {
        login(accessToken, newUser);
        await refreshUser();
      }

      setSuccessState({
        message: "Your hospitality workspace and 14-day free trial have been provisioned!",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toLocaleDateString(),
      });
    } catch (err) {
      console.error(err);
      setErrorMessage("An unexpected network error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBillingCycle = async (newCycle: "MONTHLY" | "YEARLY") => {
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/subscription/my-subscription/billing-cycle", {
        method: "PATCH",
        body: JSON.stringify({ billingCycle: newCycle }),
      });
      const data = await res.json();
      if (res.ok) {
        setTenantSub((prev) => prev ? { ...prev, billingCycle: newCycle } : null);
        setCycle(newCycle === "YEARLY" ? "annual" : "monthly");
        await refreshUser();
      } else {
        setErrorMessage(data.message || "Failed to update billing cycle.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to update billing cycle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    setIsSubmitting(true);
    setPaymentNotice(null);
    try {
      const res = await apiFetch(`/subscription/my-invoices/${invoiceId}/pay`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentNotice(`Payment session initiated. Secret: ${data.data.clientSecret ? "Generated" : "Pending"}`);
      } else {
        // Handle Stripe configuration or server state gracefully
        setPaymentNotice(data.message || "Payment gateway is currently being configured by platform administrator. Your access remains active.");
      }
    } catch (err) {
      console.error(err);
      setPaymentNotice("Payment gateway is currently unavailable. Please contact billing support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-80px)] bg-mk-ivory-50">
      {/* Left Column: Form or Authenticated Subscription Management */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          {successState ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold ring-1 ring-emerald-600/20 mb-4">
                <Check className="size-3.5 text-emerald-600" /> Subscription Trial Activated
              </div>
              <h2 className="font-display text-3xl text-mk-ink mb-2">Welcome aboard</h2>
              <p className="text-mk-stone mb-6 leading-relaxed">
                {successState.message}
              </p>

              <div className="rounded-2xl border border-mk-ink/10 p-5 bg-mk-ivory-50/60 mb-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-mk-stone">Selected Package:</span>
                  <span className="font-semibold text-mk-ink">{packageInfo.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-mk-stone">Included Modules:</span>
                  <span className="font-mono text-xs text-mk-ink bg-white px-2 py-0.5 rounded border border-mk-ink/10">
                    {selectedModules.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-mk-stone">Trial Access:</span>
                  <span className="text-emerald-700 font-medium">14 Days Free (until {successState.trialEndsAt})</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push("/tenant/dashboard")}
                  className={cn(ctaClass("gold", "lg"), "w-full justify-center")}
                >
                  Enter Tenant Dashboard <ArrowRight className="size-4 ml-1.5" />
                </button>
                <Link
                  href="/tenant/settings/subscription"
                  className={cn(ctaClass("outline-dark", "md"), "w-full justify-center")}
                >
                  View Subscription & Invoices
                </Link>
              </div>
            </div>
          ) : !user ? (
            /* Unauthenticated Visitor Form */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mk-champagne/20 text-mk-champagne-dark text-xs font-semibold ring-1 ring-mk-champagne/30 mb-3">
                <Sparkles className="size-3.5" /> 14-Day Full Access Free Trial
              </div>
              <h2 className="font-display text-3xl text-mk-ink mb-2">Create your workspace</h2>
              <p className="text-mk-stone text-sm mb-6 leading-relaxed">
                Set up your hospitality property in seconds. No credit card required to start your trial.
              </p>

              {errorMessage && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSignupAndStartTrial} className="space-y-4">
                <div>
                  <label htmlFor="businessName" className="block text-xs font-semibold text-mk-ink uppercase tracking-wider mb-1">
                    Business / Property Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 size-4 text-mk-stone/60" />
                    <input
                      required
                      id="businessName"
                      name="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-mk-ink/10 pl-10 pr-4 py-2.5 text-sm ring-1 ring-inset ring-mk-ink/10 focus:ring-2 focus:ring-mk-champagne focus:outline-none"
                      placeholder="e.g. The Grand Palace Hotel"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ownerName" className="block text-xs font-semibold text-mk-ink uppercase tracking-wider mb-1">
                    Owner / Manager Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 size-4 text-mk-stone/60" />
                    <input
                      required
                      id="ownerName"
                      name="ownerName"
                      type="text"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-mk-ink/10 pl-10 pr-4 py-2.5 text-sm ring-1 ring-inset ring-mk-ink/10 focus:ring-2 focus:ring-mk-champagne focus:outline-none"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-mk-ink uppercase tracking-wider mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 size-4 text-mk-stone/60" />
                    <input
                      required
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-mk-ink/10 pl-10 pr-4 py-2.5 text-sm ring-1 ring-inset ring-mk-ink/10 focus:ring-2 focus:ring-mk-champagne focus:outline-none"
                      placeholder="e.g. manager@grandpalace.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-mk-ink uppercase tracking-wider mb-1">
                    Password (min 8 characters)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 size-4 text-mk-stone/60" />
                    <input
                      required
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-mk-ink/10 pl-10 pr-4 py-2.5 text-sm ring-1 ring-inset ring-mk-ink/10 focus:ring-2 focus:ring-mk-champagne focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-mk-ink uppercase tracking-wider mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 size-4 text-mk-stone/60" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-mk-ink/10 pl-10 pr-4 py-2.5 text-sm ring-1 ring-inset ring-mk-ink/10 focus:ring-2 focus:ring-mk-champagne focus:outline-none"
                      placeholder="+1 (555) 012-3456"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(ctaClass("gold", "lg"), "w-full mt-4 justify-center shadow-lg shadow-mk-champagne/20")}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw className="size-4 animate-spin" /> Provisioning Workspace…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      Start 14-Day Free Trial <ArrowRight className="size-4" />
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-mk-ink/5 text-center text-xs text-mk-stone">
                Already have an account?{" "}
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/home/checkout?package=${pkg}&tier=${tier}&cycle=${cycle}`)}`}
                  className="font-semibold text-mk-ink underline hover:text-mk-champagne-dark"
                >
                  Sign in to continue
                </Link>
              </div>
            </div>
          ) : user.role === "SUPER_ADMIN" ? (
            /* Super Admin View */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold ring-1 ring-blue-600/20 mb-4">
                <ShieldCheck className="size-4 text-blue-600" /> Platform Super Administrator
              </div>
              <h2 className="font-display text-3xl text-mk-ink mb-2">Platform Admin Portal</h2>
              <p className="text-mk-stone mb-6 leading-relaxed text-sm">
                You are currently signed in as a Super Admin ({user.email}). Super Admins configure system-wide subscription tiers and oversee tenant billing directly from the Super Admin portal.
              </p>

              <div className="space-y-3">
                <Link href="/super-admin/subscriptions" className={cn(ctaClass("gold", "lg"), "w-full justify-center")}>
                  Manage All Tenant Subscriptions <ArrowRight className="size-4 ml-1.5" />
                </Link>
                <Link href="/super-admin" className={cn(ctaClass("outline-dark", "md"), "w-full justify-center")}>
                  Go to Super Admin Overview
                </Link>
              </div>
            </div>
          ) : (
            /* Authenticated Tenant View */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold ring-1 ring-emerald-600/20 mb-4">
                <Building2 className="size-3.5 text-emerald-600" /> Connected Workspace: {tenant?.name || "Active Property"}
              </div>
              <h2 className="font-display text-3xl text-mk-ink mb-2">Subscription Overview</h2>
              <p className="text-mk-stone mb-6 text-sm">
                Signed in as <span className="font-semibold text-mk-ink">{user.name}</span> ({user.email}).
              </p>

              {paymentNotice && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-2.5">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>{paymentNotice}</span>
                </div>
              )}

              {isLoadingTenantSub ? (
                <div className="py-8 text-center text-sm text-mk-stone flex items-center justify-center gap-2">
                  <RefreshCw className="size-4 animate-spin" /> Loading subscription details…
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-mk-ink/10 p-5 bg-mk-ivory-50/60 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-mk-stone">Current Status:</span>
                      <span className="font-semibold uppercase text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {tenantSub?.status || tenant?.subscription?.status || "TRIALING"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-mk-stone">Plan Name:</span>
                      <span className="font-medium text-mk-ink">
                        {tenantSub?.planName || packageInfo.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-mk-stone">Billing Cadence:</span>
                      <span className="font-medium text-mk-ink">
                        {tenantSub?.billingCycle === "YEARLY" ? "Annual Billing" : "Monthly Billing"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-mk-stone">Subscribed Modules:</span>
                      <div className="flex flex-wrap gap-1">
                        {(tenantSub?.features || tenant?.subscribedModules || selectedModules).map((m) => (
                          <span key={m} className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-mk-ink/10 text-mk-ink">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Open Invoices, if any */}
                  {tenantSub?.openInvoices && tenantSub.openInvoices.length > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                        Open Invoices
                      </h4>
                      {tenantSub.openInvoices.map((inv) => (
                        <div key={inv._id} className="flex justify-between items-center py-2 border-b border-amber-200/60 last:border-0 text-xs">
                          <div>
                            <span className="font-semibold text-mk-ink">{inv.number}</span>
                            <span className="text-mk-stone ml-2">Due {new Date(inv.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-mk-ink">${(inv.totalMinor / 100).toFixed(2)}</span>
                            <button
                              onClick={() => handlePayInvoice(inv._id)}
                              disabled={isSubmitting}
                              className="px-2.5 py-1 rounded bg-mk-ink text-white text-[11px] font-semibold hover:bg-mk-ink/90 flex items-center gap-1"
                            >
                              <CreditCard className="size-3" /> Pay Invoice
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Billing Cycle Switch */}
                  <div className="pt-2">
                    <span className="block text-xs font-semibold text-mk-ink uppercase tracking-wider mb-2">
                      Switch Billing Cadence
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleUpdateBillingCycle("MONTHLY")}
                        disabled={isSubmitting}
                        className={cn(
                          "py-2 px-3 rounded-xl border text-xs font-semibold transition-all",
                          tenantSub?.billingCycle === "MONTHLY"
                            ? "bg-mk-ink text-white border-mk-ink"
                            : "bg-white text-mk-ink border-mk-ink/15 hover:border-mk-ink/30"
                        )}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => handleUpdateBillingCycle("YEARLY")}
                        disabled={isSubmitting}
                        className={cn(
                          "py-2 px-3 rounded-xl border text-xs font-semibold transition-all",
                          tenantSub?.billingCycle === "YEARLY"
                            ? "bg-mk-ink text-white border-mk-ink"
                            : "bg-white text-mk-ink border-mk-ink/15 hover:border-mk-ink/30"
                        )}
                      >
                        Annual (20% Off)
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    <button
                      onClick={() => router.push("/tenant/dashboard")}
                      className={cn(ctaClass("gold", "lg"), "w-full justify-center")}
                    >
                      Go to Tenant Dashboard <ArrowRight className="size-4 ml-1.5" />
                    </button>
                    <Link
                      href="/tenant/settings/subscription"
                      className={cn(ctaClass("outline-dark", "md"), "w-full justify-center")}
                    >
                      Full Subscription & Invoices
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Order & Plan Summary */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-20 bg-mk-ivory-50 border-t lg:border-t-0 lg:border-l border-mk-ink/5">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-semibold tracking-wider text-mk-ink uppercase">Selected Package</h3>
            <Link href="/home/pricing" className="text-xs font-medium text-mk-champagne-dark hover:underline flex items-center gap-1">
              Change plan <ExternalLink className="size-3" />
            </Link>
          </div>
          
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-mk-ink/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-display text-2xl text-mk-ink">{packageInfo.name}</h4>
                <p className="text-xs text-mk-stone mt-1">{tierInfo.name} Tier · {packageInfo.tagline}</p>
              </div>
              <div className="text-right">
                {price !== null ? (
                  <>
                    <div className="text-3xl font-semibold text-mk-ink">${price}</div>
                    <div className="text-xs text-mk-stone mt-1">
                      {cycle === "annual" ? "/mo (annual billing)" : "/mo (monthly)"}
                    </div>
                  </>
                ) : (
                  <div className="text-3xl font-semibold text-mk-ink">Custom</div>
                )}
              </div>
            </div>

            {/* Trial Banner */}
            <div className="mb-6 rounded-2xl bg-mk-ivory-50 p-4 border border-mk-ink/5 flex items-start gap-3">
              <ShieldCheck className="size-5 text-mk-champagne-dark shrink-0 mt-0.5" />
              <div className="text-xs text-mk-stone">
                <span className="font-semibold text-mk-ink block mb-0.5">14-Day Free Evaluation Period</span>
                Enjoy complete access with all core features enabled. You will only be billed after your 14-day trial concludes.
              </div>
            </div>

            <div className="h-px w-full bg-mk-ink/5 my-6" />

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-mk-ink mb-4">Included Modules</p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {selectedModules.map((m) => (
                  <span key={m} className="inline-flex items-center gap-1 rounded-md bg-mk-ink/5 px-2.5 py-1 text-xs font-medium text-mk-ink">
                    <Check className="size-3 text-emerald-600" /> {m}
                  </span>
                ))}
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-mk-ink mb-4">Feature Highlights</p>
              <ul className="space-y-3">
                {tierInfo.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-mk-stone">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-mk-champagne-dark" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-mk-stone">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
