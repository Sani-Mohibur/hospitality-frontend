"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import heroLobby from "@/assets/home/hero-lobby.jpg";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { Accent } from "@/components/home/primitives";
import { AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import { AuthAlert, AuthField, AuthSubmit, EMAIL_RE } from "@/components/auth/auth-form";

type FieldErrors = { email?: string; password?: string };

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(email, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        requireAuth: false,
      });

      const data = await res.json();

      if (res.ok) {
        // Handle successful login
        const loggedUser = data.data.user || data.data;
        login(data.data.accessToken, loggedUser);

        // Redirect to origin or dashboard
        const redirect = searchParams.get("redirect");
        const role = loggedUser?.role;
        if (role === "SUPER_ADMIN") {
          if (redirect && redirect.startsWith("/super-admin")) {
            router.push(redirect);
          } else {
            router.push("/super-admin");
          }
        } else {
          if (redirect && !redirect.startsWith("/super-admin")) {
            router.push(redirect);
          } else {
            router.push("/account");
          }
        }
      } else {
        setError(data.message || "Failed to login. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeading
        eyebrow="Member sign in"
        title={
          <>
            Welcome <Accent>back</Accent>.
          </>
        }
        description="Sign in to manage your properties, outlets and team."
      />

      <form onSubmit={handleLogin} noValidate className="space-y-5" aria-describedby={error ? "login-error" : undefined}>
        <div id="login-error">
          <AuthAlert message={error} />
        </div>

        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email address"
          icon={Mail}
          autoComplete="email"
          inputMode="email"
          placeholder="you@yourhotel.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
          }}
          error={fieldErrors.email}
          disabled={loading}
          autoFocus
        />

        <AuthField
          id="password"
          name="password"
          type="password"
          label="Password"
          icon={Lock}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
          }}
          error={fieldErrors.password}
          disabled={loading}
        />

        <div className="pt-2">
          <AuthSubmit loading={loading} loadingLabel="Signing in…">
            Sign in
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </AuthSubmit>
        </div>
      </form>

      <div className="my-8 flex items-center gap-4 text-[0.7rem] font-semibold tracking-[0.28em] text-stone/70 uppercase">
        <span className="h-px flex-1 bg-ink/10" />
        New here
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <Link
        id="login-to-signup"
        href="/signup"
        className="flex w-full items-center justify-between rounded-2xl border border-ink/10 bg-white/60 px-5 py-4 text-left transition-all duration-300 hover:border-champagne/60 hover:bg-white hover:shadow-[0_12px_30px_-18px_rgba(184,149,90,0.6)] focus-visible:ring-2 focus-visible:ring-champagne focus-visible:outline-none"
      >
        <span>
          <span className="block text-[0.9rem] font-semibold text-ink">Create an account</span>
          <span className="block text-[0.8rem] text-stone">Set up your business in minutes</span>
        </span>
        <span className="grid size-9 place-items-center rounded-full bg-champagne/15 text-champagne-dark">
          <ArrowRight className="size-4" />
        </span>
      </Link>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      image={heroLobby}
      imageAlt="Concierge desk of a boutique hotel lobby"
      eyebrow="Hospitality OS"
      headline={
        <>
          Every arrival, every order — <Accent>one refined</Accent> console.
        </>
      }
      aside={
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-champagne/30 text-champagne-light">
            <ShieldCheck className="size-4" />
          </span>
          <p className="text-[0.85rem] leading-relaxed text-ivory/60">
            Your access is tied to your role. Platform administrators and property teams each land in
            their own workspace after signing in.
          </p>
        </div>
      }
      fullBleedImage
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
