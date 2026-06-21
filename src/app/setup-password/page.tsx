"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "done">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});

  useEffect(() => {
    if (!token) { setStatus("invalid"); setErrorMsg("No token provided."); return; }
    fetch(`/api/setup-password?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setStatus("invalid"); setErrorMsg(data.error); }
        else { setUserName(data.data.name); setStatus("valid"); }
      })
      .catch(() => { setStatus("invalid"); setErrorMsg("Could not validate link."); });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: typeof fieldErrors = {};
    if (password.length < 8) errors.password = "Password must be at least 8 characters";
    if (password !== confirm) errors.confirm = "Passwords do not match";
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setSaving(true);
    try {
      const res = await fetch("/api/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || "Failed to set password"); return; }
      setStatus("done");
      setTimeout(() => router.push("/login"), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="DNA Worldwide" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold" style={{ color: "#1a3d8f" }}>Set Your Password</h1>
          <p className="text-slate-500 mt-1">Create a password to access your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {status === "loading" && (
            <div className="flex items-center justify-center gap-3 py-8 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Validating your link…</span>
            </div>
          )}

          {status === "invalid" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <AlertCircle className="h-10 w-10 text-red-400" />
              <p className="font-semibold text-slate-800">Link unavailable</p>
              <p className="text-sm text-slate-500">{errorMsg}</p>
              <Button variant="outline" className="mt-2" onClick={() => router.push("/login")}>
                Go to Login
              </Button>
            </div>
          )}

          {status === "done" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
              <p className="font-semibold text-slate-800">Password set!</p>
              <p className="text-sm text-slate-500">Redirecting you to login…</p>
            </div>
          )}

          {status === "valid" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {userName && (
                <p className="text-sm text-slate-600 mb-2">
                  Welcome, <strong>{userName}</strong>. Choose a password to get started.
                </p>
              )}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}
              <Input
                label="New password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={fieldErrors.confirm}
              />
              <Button type="submit" className="w-full" size="lg" loading={saving}>
                Set Password & Continue
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense>
      <SetupPasswordForm />
    </Suspense>
  );
}
