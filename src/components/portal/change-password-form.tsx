"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const currentPassword = form.get("currentPassword") as string;
    const newPassword = form.get("newPassword") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setSuccess(true);
      e.currentTarget.reset();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 max-w-sm">
      <Input id="currentPassword" name="currentPassword" type="password" label="Current password" autoComplete="current-password" required />
      <Input id="newPassword" name="newPassword" type="password" label="New password" autoComplete="new-password" minLength={8} required />
      <Input id="confirmPassword" name="confirmPassword" type="password" label="Confirm new password" autoComplete="new-password" minLength={8} required />

      {error && (
        <div className="p-2.5 rounded-lg bg-danger-bg border border-danger-line text-[13px] text-danger-ink">
          {error}
        </div>
      )}
      {success && (
        <div className="p-2.5 rounded-lg bg-brand-light border border-brand-line text-[13px] text-brand-dark">
          Password updated.
        </div>
      )}

      <Button type="submit" loading={loading}>Update password</Button>
    </form>
  );
}
