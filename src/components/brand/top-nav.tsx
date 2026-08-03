"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TopNav({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header
      className="sticky top-0 z-20 shadow-md"
      style={{ background: "linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid place-items-center w-[42px] h-[42px] rounded-[10px] bg-white/95 border border-white/50 shadow shrink-0">
            <img src="/logo.png" alt="" className="w-7 h-7 object-contain" />
          </span>
          <div>
            <h1 className="text-white text-[17px] font-bold leading-tight">DNA Worldwide</h1>
            <p className="text-white/75 text-xs leading-tight">Staff Portal</p>
          </div>
        </Link>

        <div className="flex items-center gap-3.5">
          {isAdmin && (
            <Link
              href="/instructor/dashboard"
              className="text-white bg-white/12 hover:bg-white/22 border border-white/35 rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors"
            >
              Admin
            </Link>
          )}
          <div className="flex items-center gap-2.5 pl-3.5 border-l border-white/25">
            <span className="hidden sm:inline text-white/85 text-xs max-w-[160px] truncate">{email}</span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-white bg-transparent hover:bg-white/15 border border-white/25 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors disabled:opacity-60"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
