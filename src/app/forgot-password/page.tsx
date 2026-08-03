"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { AuthShell } from "@/components/brand/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong — please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div
        className="w-[400px] bg-white/97 backdrop-blur-xl rounded-[20px] border border-white/50 p-9 pt-8 pb-7"
        style={{ boxShadow: "0 30px 70px rgba(8,20,40,0.35)", animation: "brand-card-in 0.7s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt=""
            className="w-[46px] h-[46px] mx-auto mb-2.5"
            style={{ animation: "brand-mark-in 0.7s 0.15s cubic-bezier(0.22,1,0.36,1) both" }}
          />
          <h1 className="text-[19px] font-extrabold text-ink tracking-tight">Reset your password</h1>
          <p className="text-[12.5px] text-ink-faint mt-0.5">We&apos;ll email you a link to set a new one</p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center" style={{ animation: "brand-fade-up 0.3s ease both" }}>
            <CheckCircle className="h-10 w-10 text-emerald-500" />
            <p className="font-semibold text-slate-800">Check your email</p>
            <p className="text-sm text-slate-500">
              If an account exists for that email, we&apos;ve sent a link to reset your password. It expires in 1 hour.
            </p>
            <Link href="/login" className="text-sm font-medium mt-2" style={{ color: "var(--color-brand)" }}>
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" style={{ animation: "brand-fade-up 0.3s ease both" }}>
            <Input id="email" name="email" type="email" label="Email" placeholder="you@dnaworkplace.com" autoComplete="username" required />

            {error && (
              <div className="p-2.5 rounded-lg bg-danger-bg border border-danger-line text-[13px] text-danger-ink">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Send reset link
            </Button>

            <Link
              href="/login"
              className="block text-center text-[13px] text-ink-faint hover:text-ink transition-colors"
            >
              Back to login
            </Link>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
