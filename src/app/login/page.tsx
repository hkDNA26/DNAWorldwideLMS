"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/brand/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Incorrect email or password.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
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
          <h1 className="text-[19px] font-extrabold text-ink tracking-tight">DNA Worldwide</h1>
          <p className="text-[12.5px] text-ink-faint mt-0.5">Staff Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4" style={{ animation: "brand-fade-up 0.3s ease both" }}>
          <Input id="email" name="email" type="email" label="Email" placeholder="you@dnaworkplace.com" autoComplete="username" required />
          <Input id="password" name="password" type="password" label="Password" placeholder="••••••••" autoComplete="current-password" required />

          {error && (
            <div className="p-2.5 rounded-lg bg-danger-bg border border-danger-line text-[13px] text-danger-ink">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Log in
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
