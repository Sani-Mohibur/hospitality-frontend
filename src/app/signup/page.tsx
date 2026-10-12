"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Building2, Check, Lock, Mail, User } from "lucide-react";
import resortTerrace from "@/assets/home/resort-terrace.jpg";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Accent } from "@/components/home/primitives";
import { AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import { AuthAlert, AuthField, AuthSubmit, EMAIL_RE } from "@/components/auth/auth-form";
import { TRIAL_DAYS } from "@/lib/marketing/plans";

type SignupForm = { businessName: string; ownerName: string; email: string; password: string };
type FieldErrors = Partial<Record<keyof SignupForm, string>>;

/** Mirrors the backend /auth/signup validation (businessName ≥ 2, password ≥ 8). */
function validate(f: SignupForm): FieldErrors {
  const errors: FieldErrors = {};
  if (f.businessName.trim().length < 2) errors.businessName = "Business name must be at least 2 characters.";
  if (!f.ownerName.trim()) errors.ownerName = "Enter your full name.";
  if (!f.email.trim()) errors.email = "Enter your work email.";
  else if (!EMAIL_RE.test(f.email.trim())) errors.email = "Enter a valid email address.";
  if (f.password.length < 8) errors.password = "Password must be at least 8 characters.";
  return errors;
}

function PasswordMeter({ value }: { value: string }) {
  const score =
    (value.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(value) && /[a-z]/.test(value) ? 1 : 0) +
    (/\d/.test(value) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(value) ? 1 : 0);
  const labels = ["Too short", "Fair", "Good", "Strong", "Excellent"];
  if (!value) return null;
  return (
    <div className="-mt-2 flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < score ? (score <= 1 ? "bg-bordeaux/70" : score === 2 ? "bg-champagne" : "bg-forest") : "bg-ink/10",
            )}
          />
        ))}
      </div>
      <span className="w-16 text-right text-[0.72rem] font-medium text-stone">
        {value.length < 8 ? labels[0] : labels[score]}
      </span>
    </div>
  );
}

function SignupContent() {
  const [SignupForm, setFormData] = useState<SignupForm>({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const pkgParam = searchParams.get("package");
  const selectedModules = pkgParam === "hotel"
    ? ["HOSPITALITY"]
    : pkgParam === "restaurant"
      ? ["RESTAURANT"]
      : ["HOSPITALITY", "RESTAURANT"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.id as keyof SignupForm;
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
    if (fieldErrors[key]) setFieldErrors((f) => ({ ...f, [key]: undefined }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(SignupForm);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          ...SignupForm,
          modules: selectedModules,
        }),
        requireAuth: false,
      });

      const data = await res.json();

      if (res.ok) {
        // Handle successful signup
        const user = data.data.user || data.data;
        login(data.data.accessToken, user);
        const redirect = searchParams.get("redirect") || "/tenant/dashboard";
        router.push(redirect);
      } else {
        setError(data.message || "Failed to sign up. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      image={resortTerrace}
      imageAlt="Sunlit resort terrace overlooking the sea"
      eyebrow={`${TRIAL_DAYS}-day free trial`}
      headline={
        <>
          Open your doors to <Accent>effortless</Accent> operations.
        </>
      }
      aside={
        <ul className="space-y-3 text-[0.85rem] text-ivory/65">
          {[
            "Front desk, POS and kitchen in one platform",
            "Invite your team with role-based access",
            "No setup fees · cancel anytime",
          ].map((t) => (
            <li key={t} className="flex items-center gap-3">
              <span className="grid size-5 place-items-center rounded-full bg-champagne/20 text-champagne-light">
                <Check className="size-3" />
              </span>
              {t}
            </li>
          ))}
        </ul>
      }
      fullBleedImage
    >
      <AuthHeading
        eyebrow="Create your account"
        title={
          <>
            Begin your <Accent>trial</Accent>.
          </>
        }
        description="Set up your business workspace. You’ll be the owner and can invite staff later."
      />

      <form onSubmit={handleSignup} noValidate className="space-y-5">
        <AuthAlert message={error} />

        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField
            id="businessName"
            name="businessName"
            label="Business name"
            icon={Building2}
            autoComplete="organization"
            placeholder="The Grand Hotel"
            value={SignupForm.businessName}
            onChange={handleChange}
            error={fieldErrors.businessName}
            disabled={loading}
            autoFocus
          />
          <AuthField
            id="ownerName"
            name="ownerName"
            label="Your name"
            icon={User}
            autoComplete="name"
            placeholder="Jane Doe"
            value={SignupForm.ownerName}
            onChange={handleChange}
            error={fieldErrors.ownerName}
            disabled={loading}
          />
        </div>

        <AuthField
          id="email"
          name="email"
          type="email"
          label="Work email"
          icon={Mail}
          autoComplete="email"
          inputMode="email"
          placeholder="you@yourhotel.com"
          value={SignupForm.email}
          onChange={handleChange}
          error={fieldErrors.email}
          disabled={loading}
        />

        <AuthField
          id="password"
          name="password"
          type="password"
          label="Password"
          icon={Lock}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use 8 or more characters with a mix of letters, numbers and symbols."
          value={SignupForm.password}
          onChange={handleChange}
          error={fieldErrors.password}
          disabled={loading}
        />
        <PasswordMeter value={SignupForm.password} />

        <div className="pt-2">
          <AuthSubmit loading={loading} loadingLabel="Creating your workspace…">
            Create account
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </AuthSubmit>
        </div>
      </form>

      <p className="mt-8 text-center text-[0.85rem] text-stone">
        Already have an account?{" "}
        <Link
          id="signup-to-login"
          href="/login"
          className="font-semibold text-ink underline decoration-champagne/50 decoration-2 underline-offset-4 transition-colors hover:decoration-champagne focus-visible:ring-2 focus-visible:ring-champagne focus-visible:outline-none"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}
