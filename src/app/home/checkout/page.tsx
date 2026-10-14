"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Container, Accent, ctaClass, Eyebrow } from "@/components/home/primitives";
import {
  PACKAGES,
  TIERS,
  getTier,
  isPackageId,
  isTierId,
  isBillingCycle,
  priceFor,
  PackageId,
  TierId,
  BillingCycle,
  TRIAL_DAYS,
} from "@/lib/marketing/plans";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  Sparkles,
  RefreshCw,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Undo2,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  const monthlyPrice = tierInfo.monthly;
  const effectiveMonthly = monthlyPrice !== null ? priceFor(monthlyPrice, cycle) : null;
  const totalDueToday =
    effectiveMonthly !== null ? (cycle === "annual" ? effectiveMonthly * 12 : effectiveMonthly) : null;

  // Checkout flow state: "review" | "processing" | "success" | "failed"
  const [checkoutStep, setCheckoutStep] = useState<"review" | "processing" | "success" | "failed">("review");
  const [paymentNotice, setPaymentNotice] = useState<{ type: "error" | "info"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentRef, setPaymentRef] = useState<string>("");

  // Unauthenticated signup form state
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [signupError, setSignupError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (signupError) setSignupError("");
  };

  // Register user with NO modules initially (modules: [])
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      setSignupError("Password must be at least 8 characters long.");
      return;
    }
    if (formData.businessName.trim().length < 2) {
      setSignupError("Property or business name must be at least 2 characters long.");
      return;
    }

    setIsSigningUp(true);
    setSignupError("");

    try {
      const res = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          businessName: formData.businessName.trim(),
          ownerName: formData.ownerName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim() || undefined,
          modules: [], // No initial modules granted until mock checkout completes
        }),
        requireAuth: false,
      });

      const resData = await res.json();

      if (!res.ok) {
        setSignupError(resData.message || "Failed to create account. Please try again.");
        return;
      }

      // Log user in and refresh auth state; advances to the authenticated mock payment step
      const accessToken = resData.data?.accessToken;
      const newUser = resData.data?.user || resData.data;
      if (accessToken && newUser) {
        login(accessToken, newUser);
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
      setSignupError("An unexpected network error occurred. Please check your connection.");
    } finally {
      setIsSigningUp(false);
    }
  };

  // Mock payment execution (simulates developer test payment)
  const executeMockPayment = async (simulateSuccess: boolean) => {
    setIsSubmitting(true);
    setPaymentNotice(null);
    setCheckoutStep("processing");

    // Realistic mock processing delay
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (!simulateSuccess) {
      setIsSubmitting(false);
      setCheckoutStep("failed");
      setPaymentNotice({
        type: "error",
        message:
          "Payment authorization declined (simulated decline). Your test card was declined and no subscription was created.",
      });
      return;
    }

    const generatedRef = `MOCK_TX_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      const res = await apiFetch("/subscription/subscribe", {
        method: "POST",
        body: JSON.stringify({
          packageId: pkg,
          tierId: tier,
          billingCycle: cycle === "annual" ? "YEARLY" : "MONTHLY",
          modules: packageInfo.modules,
          planName: `${packageInfo.name} (${tierInfo.name})`,
          mockPaymentSuccess: true,
          paymentRef: generatedRef,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPaymentRef(generatedRef);
        await refreshUser();
        setCheckoutStep("success");
      } else {
        setCheckoutStep("failed");
        setPaymentNotice({
          type: "error",
          message: data.message || "Failed to activate subscription. Please try again.",
        });
      }
    } catch (err) {
      console.error(err);
      setCheckoutStep("failed");
      setPaymentNotice({
        type: "error",
        message: "Network error while connecting to subscription billing engine.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-ivory text-ink">
      <div className="grid lg:grid-cols-12 min-h-full">
        {/* ===================================================================
            Left Column: Registration OR Mock Payment Controls
            =================================================================== */}
        <div className="lg:col-span-7 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white border-b lg:border-b-0 lg:border-r border-ink/5">
          <div className="w-full max-w-xl mx-auto">
            {/* Super Admin Notice */}
            {user?.role === "SUPER_ADMIN" ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold ring-1 ring-blue-600/20 mb-4">
                  <ShieldCheck className="size-4 text-blue-600" /> Platform Super Administrator
                </div>
                <h2 className="font-display text-3xl text-ink mb-2">Platform Administration</h2>
                <p className="text-stone mb-6 leading-relaxed text-sm">
                  You are signed in as a Super Admin ({user.email}). Super Admins configure system-wide subscription tiers and oversee tenant billing directly from the Super Admin portal.
                </p>
                <div className="space-y-3">
                  <Link href="/super-admin/subscriptions" className={cn(ctaClass("gold", "lg"), "w-full justify-center")}>
                    Manage All Subscriptions <ArrowRight className="size-4 ml-1.5" />
                  </Link>
                  <Link href="/super-admin" className={cn(ctaClass("outline-dark", "md"), "w-full justify-center")}>
                    Go to Super Admin Overview
                  </Link>
                </div>
              </div>
            ) : !user ? (
              /* ===============================================================
                 Step 1: Unauthenticated Visitor Registration
                 =============================================================== */
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne/15 text-champagne-dark text-xs font-semibold ring-1 ring-champagne/30 mb-3">
                  <Sparkles className="size-3.5" /> Step 1 of 2: Create Your Workspace
                </div>
                <h2 className="font-display text-3xl sm:text-4xl text-ink tracking-tight mb-2">
                  Begin your <Accent>subscription</Accent>
                </h2>
                <p className="text-stone text-sm mb-6 leading-relaxed">
                  Create your administrator account below. Module access and subscription will be activated upon completing the mock payment confirmation.
                </p>

                {signupError && (
                  <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5">
                    <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{signupError}</span>
                  </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label htmlFor="businessName" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                      Property / Business Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 size-4 text-stone/60" />
                      <input
                        required
                        id="businessName"
                        name="businessName"
                        type="text"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border-ink/10 pl-10 pr-4 py-2.5 text-sm ring-1 ring-inset ring-ink/10 focus:ring-2 focus:ring-champagne focus:outline-none"
                        placeholder="e.g. Grand Azure Resort"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ownerName" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 size-4 text-stone/60" />
                      <input
                        required
                        id="ownerName"
                        name="ownerName"
                        type="text"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border-ink/10 pl-10 pr-4 py-2.5 text-sm ring-1 ring-inset ring-ink/10 focus:ring-2 focus:ring-champagne focus:outline-none"
                        placeholder="e.g. Eleanor Vance"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 size-4 text-stone/60" />
                      <input
                        required
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border-ink/10 pl-10 pr-4 py-2.5 text-sm ring-1 ring-inset ring-ink/10 focus:ring-2 focus:ring-champagne focus:outline-none"
                        placeholder="e.g. eleanor@grandazure.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                      Password (min 8 characters)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 size-4 text-stone/60" />
                      <input
                        required
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border-ink/10 pl-10 pr-4 py-2.5 text-sm ring-1 ring-inset ring-ink/10 focus:ring-2 focus:ring-champagne focus:outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 size-4 text-stone/60" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border-ink/10 pl-10 pr-4 py-2.5 text-sm ring-1 ring-inset ring-ink/10 focus:ring-2 focus:ring-champagne focus:outline-none"
                        placeholder="+1 (555) 012-3456"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSigningUp}
                    className={cn(ctaClass("gold", "lg"), "w-full mt-4 justify-center shadow-lg shadow-champagne/20 cursor-pointer")}
                  >
                    {isSigningUp ? (
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="size-4 animate-spin" /> Creating Account…
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        Continue to Mock Payment <ArrowRight className="size-4" />
                      </span>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-ink/5 text-center text-xs text-stone">
                  Already have an account?{" "}
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/home/checkout?package=${pkg}&tier=${tier}&cycle=${cycle}`)}`}
                    className="font-semibold text-ink underline hover:text-champagne-dark"
                  >
                    Sign in to continue
                  </Link>
                </div>
              </div>
            ) : checkoutStep === "success" ? (
              /* ===============================================================
                 Step 3: Successful Purchase State
                 =============================================================== */
              <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-4">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-500/10 mb-5">
                  <CheckCircle2 className="size-9" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
                  <Check className="size-3.5" /> Subscription Active &amp; Entitled
                </div>
                <h2 className="font-display text-3xl sm:text-4xl text-ink mb-3">
                  Welcome to Hospitality OS
                </h2>
                <p className="text-stone text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  Your mock payment for <strong className="text-ink">{packageInfo.name}</strong> was authorized successfully. Your workspace modules and live dashboard are fully enabled.
                </p>

                <div className="rounded-2xl border border-ink/10 bg-ivory/60 p-6 text-left space-y-3 mb-8">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone">Transaction Reference:</span>
                    <span className="font-mono text-ink font-semibold">{paymentRef}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone">Active Workspace:</span>
                    <span className="font-medium text-ink">{tenant?.name || "Connected Workspace"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone">Activated Modules:</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {packageInfo.modules.map((m) => (
                        <span key={m} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] font-semibold">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-w-sm mx-auto">
                  <button
                    onClick={() => router.push("/tenant/dashboard")}
                    className={cn(ctaClass("gold", "lg"), "w-full justify-center cursor-pointer shadow-lg shadow-champagne/20")}
                  >
                    Enter Tenant Dashboard <ArrowRight className="size-4 ml-1.5" />
                  </button>
                  <Link
                    href="/account"
                    className={cn(ctaClass("outline-dark", "md"), "w-full justify-center")}
                  >
                    View Account Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              /* ===============================================================
                 Step 2: Authenticated Order Review & Mock Checkout
                 =============================================================== */
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/15 text-champagne-dark text-xs font-semibold ring-1 ring-champagne/30">
                    <Sparkles className="size-3.5" /> Step 2: Confirm &amp; Mock Payment
                  </div>
                  <span className="text-xs text-stone">
                    Signed in as <strong className="text-ink">{user.name}</strong>
                  </span>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl text-ink tracking-tight mb-2">
                  Review &amp; <Accent>Activate</Accent>
                </h2>
                <p className="text-stone text-sm mb-6 leading-relaxed">
                  Review your selected modules and simulate the payment transaction to activate your workspace subscription.
                </p>

                {/* Error Banner */}
                {paymentNotice && paymentNotice.type === "error" && (
                  <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5">
                    <XCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
                    <div className="flex-1">
                      <p className="font-semibold mb-0.5">Payment Failed</p>
                      <p>{paymentNotice.message}</p>
                    </div>
                  </div>
                )}

                {/* Billing Cycle Cadence Toggle */}
                <div className="mb-6 rounded-2xl bg-ivory/80 p-4 border border-ink/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink">Billing Frequency</span>
                    <span className="text-xs font-semibold text-champagne-dark">Save 20% on Annual</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCycle("monthly")}
                      className={cn(
                        "py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer",
                        cycle === "monthly"
                          ? "bg-espresso text-ivory border-espresso shadow-sm"
                          : "bg-white text-ink border-ink/10 hover:border-ink/20"
                      )}
                    >
                      Monthly Cadence
                    </button>
                    <button
                      type="button"
                      onClick={() => setCycle("annual")}
                      className={cn(
                        "py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer",
                        cycle === "annual"
                          ? "bg-espresso text-ivory border-espresso shadow-sm"
                          : "bg-white text-ink border-ink/10 hover:border-ink/20"
                      )}
                    >
                      Annual Cadence (20% Off)
                    </button>
                  </div>
                </div>

                {/* Mock Card Payment Box */}
                <div className="rounded-2xl border border-ink/10 p-5 bg-linen/50 mb-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-ink/5 pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-4 text-champagne-dark" />
                      <span className="text-xs font-bold uppercase tracking-wider text-ink">
                        Development Mock Gateway
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-stone bg-white px-2 py-0.5 rounded border border-ink/10">
                      Sandbox Mode
                    </span>
                  </div>

                  <div className="rounded-xl bg-white p-4 border border-ink/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-espresso text-champagne grid place-items-center font-bold text-xs">
                        💳
                      </div>
                      <div>
                        <div className="font-mono font-medium text-ink">•••• •••• •••• 4242</div>
                        <div className="text-[11px] text-stone">Expires 12/28 · CVC 888 (Simulated)</div>
                      </div>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-600/20">
                      Test Card Ready
                    </span>
                  </div>

                  <p className="text-[11px] text-stone leading-relaxed">
                    Module entitlements are withheld until payment is explicitly approved. Select an outcome below to test the complete transaction lifecycle.
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => executeMockPayment(true)}
                    disabled={isSubmitting}
                    className={cn(
                      ctaClass("gold", "lg"),
                      "w-full justify-center cursor-pointer shadow-lg shadow-champagne/20"
                    )}
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="size-4 animate-spin" /> Authorizing Payment…
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        Confirm &amp; Simulate Payment {totalDueToday !== null && `($${totalDueToday})`}
                        <ArrowRight className="size-4" />
                      </span>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => executeMockPayment(false)}
                      disabled={isSubmitting}
                      className="py-2.5 px-4 rounded-xl text-xs font-semibold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100/70 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="size-3.5 text-red-600" />
                      Simulate Decline
                    </button>

                    <Link
                      href="/account"
                      className="py-2.5 px-4 rounded-xl text-xs font-semibold border border-ink/10 bg-white text-ink hover:bg-ivory transition-colors flex items-center justify-center gap-1.5 text-center"
                    >
                      <Undo2 className="size-3.5 text-stone" />
                      Cancel Order
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            Right Column: Plan & Entitlement Summary
            =================================================================== */}
        <div className="lg:col-span-5 flex flex-col justify-center px-6 py-12 lg:px-12 bg-ivory">
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold tracking-wider text-ink uppercase">Selected Package</h3>
              <Link
                href="/home/pricing"
                className="text-xs font-semibold text-champagne-dark hover:underline flex items-center gap-1"
              >
                Change Package <ExternalLink className="size-3" />
              </Link>
            </div>

            <div className="rounded-3xl bg-white p-7 sm:p-8 shadow-sm ring-1 ring-ink/5">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-display text-2xl text-ink">{packageInfo.name}</h4>
                  <p className="text-xs text-stone mt-0.5">
                    {tierInfo.name} Tier · {packageInfo.tagline}
                  </p>
                </div>
                <div className="text-right">
                  {effectiveMonthly !== null ? (
                    <>
                      <div className="text-3xl font-semibold text-ink">${effectiveMonthly}</div>
                      <div className="text-[11px] text-stone mt-0.5">
                        {cycle === "annual" ? "/mo (annual billing)" : "/mo (monthly)"}
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-semibold text-ink">Custom</div>
                  )}
                </div>
              </div>

              {/* Order Cost Breakdown */}
              <div className="rounded-2xl bg-linen/50 p-4 border border-ink/5 mb-6 space-y-2 text-xs">
                <div className="flex justify-between text-stone">
                  <span>Base Monthly Rate:</span>
                  <span className="font-medium text-ink">${monthlyPrice ?? 0}/mo</span>
                </div>
                {cycle === "annual" && (
                  <div className="flex justify-between text-champagne-dark font-medium">
                    <span>Annual Discount (20% Off):</span>
                    <span>-${((monthlyPrice ?? 0) - (effectiveMonthly ?? 0)) * 12}/year</span>
                  </div>
                )}
                <div className="border-t border-ink/5 pt-2 flex justify-between font-bold text-ink text-sm">
                  <span>Total Due Today:</span>
                  <span>{totalDueToday !== null ? `$${totalDueToday}` : "Contact Sales"}</span>
                </div>
              </div>

              {/* Included Modules Section */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink mb-2.5">
                    Included Modules
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {packageInfo.modules.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink border border-ink/5"
                      >
                        <Check className="size-3 text-emerald-600" />
                        {m === "HOSPITALITY"
                          ? "Hotel Management"
                          : m === "RESTAURANT"
                          ? "Restaurant POS & KDS"
                          : m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="h-px w-full bg-ink/5" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
                    Tier Capabilities
                  </p>
                  <ul className="space-y-2.5">
                    {tierInfo.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-stone">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-champagne-dark" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-stone bg-ivory">
          Loading checkout…
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
