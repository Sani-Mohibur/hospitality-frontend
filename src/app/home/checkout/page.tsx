"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Container, SectionHeading, Accent, ctaClass, Logo } from "@/components/home/primitives";
import { PACKAGES, getTier, isPackageId, isTierId, isBillingCycle, priceFor, checkoutHref } from "@/lib/marketing/plans";
import { useMarketingSession, signIn } from "@/lib/marketing/session";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const pkgParam = searchParams.get("package");
  const tierParam = searchParams.get("tier");
  const cycleParam = searchParams.get("cycle");

  const pkg = isPackageId(pkgParam) ? pkgParam : "suite";
  const tier = isTierId(tierParam) ? tierParam : "professional";
  const cycle = isBillingCycle(cycleParam) ? cycleParam : "annual";

  const packageInfo = PACKAGES[pkg];
  const tierInfo = getTier(pkg, tier);
  const price = tierInfo.monthly !== null ? priceFor(tierInfo.monthly, cycle) : null;

  const session = useMarketingSession();

  const handleDemoSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    signIn({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      business: fd.get("business") as string,
    });
  };

  const handlePurchase = () => {
    alert("This is a demo. In a real app, this would process the payment and provisioning.");
    router.push("/tenant/dashboard");
  };

  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-80px)]">
      {/* Left Column: Form or Success */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          {!session ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-display text-3xl text-mk-ink mb-2">Create your account</h2>
              <p className="text-mk-stone mb-8">Get started with Hospitality OS today.</p>
              
              <form onSubmit={handleDemoSignIn} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-mk-ink mb-1">Full Name</label>
                  <input required id="name" name="name" type="text" className="w-full rounded-lg border-mk-ink/10 px-4 py-2.5 text-sm ring-1 ring-inset ring-mk-ink/10 focus:ring-2 focus:ring-mk-champagne focus:outline-none" placeholder="Jane Doe" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-mk-ink mb-1">Work Email</label>
                  <input required id="email" name="email" type="email" className="w-full rounded-lg border-mk-ink/10 px-4 py-2.5 text-sm ring-1 ring-inset ring-mk-ink/10 focus:ring-2 focus:ring-mk-champagne focus:outline-none" placeholder="jane@example.com" />
                </div>
                <div>
                  <label htmlFor="business" className="block text-sm font-medium text-mk-ink mb-1">Business Name</label>
                  <input required id="business" name="business" type="text" className="w-full rounded-lg border-mk-ink/10 px-4 py-2.5 text-sm ring-1 ring-inset ring-mk-ink/10 focus:ring-2 focus:ring-mk-champagne focus:outline-none" placeholder="The Grand Hotel" />
                </div>
                
                <button type="submit" className={cn(ctaClass("dark", "md"), "w-full mt-4")}>
                  Continue to Payment <ArrowRight className="size-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-display text-3xl text-mk-ink mb-2">Welcome, {session.name}</h2>
              <p className="text-mk-stone mb-8">Ready to supercharge {session.business || "your business"}?</p>
              
              <div className="space-y-6">
                <div className="rounded-xl border border-mk-ink/10 p-4 bg-mk-ivory-50/50">
                  <div className="flex items-center gap-3 text-sm text-mk-stone mb-2">
                    <Check className="size-4 text-green-600" /> Account created successfully
                  </div>
                  <div className="flex items-center gap-3 text-sm text-mk-stone">
                    <Check className="size-4 text-mk-ink/20" /> Payment details (Demo Mode)
                  </div>
                </div>

                <button onClick={handlePurchase} className={cn(ctaClass("gold", "lg"), "w-full")}>
                  Complete Purchase & Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-20 bg-mk-ivory-50 border-t lg:border-t-0 lg:border-l border-mk-ink/5">
        <div className="w-full max-w-md mx-auto">
          <h3 className="text-sm font-semibold tracking-wide text-mk-ink uppercase mb-6">Order Summary</h3>
          
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-mk-ink/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-display text-xl text-mk-ink">{packageInfo.name}</h4>
                <p className="text-sm text-mk-stone mt-1">{tierInfo.name} Tier</p>
              </div>
              <div className="text-right">
                {price !== null ? (
                  <>
                    <div className="text-2xl font-semibold text-mk-ink">${price}</div>
                    <div className="text-xs text-mk-stone mt-1">{cycle === "annual" ? "/mo, billed annually" : "/mo"}</div>
                  </>
                ) : (
                  <div className="text-2xl font-semibold text-mk-ink">Custom</div>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-mk-ink/5 my-6" />

            <ul className="space-y-4">
              {tierInfo.features.slice(0, 5).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-mk-stone">
                  <Check className="mt-0.5 size-4 shrink-0 text-mk-champagne-dark" />
                  <span>{feature}</span>
                </li>
              ))}
              {tierInfo.features.length > 5 && (
                <li className="text-sm text-mk-stone italic pl-7">
                  + {tierInfo.features.length - 5} more features
                </li>
              )}
            </ul>
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
