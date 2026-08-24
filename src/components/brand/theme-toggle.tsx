"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { isDarkTheme } from "@/lib/theme-client";

/**
 * Light/dark toggle. Follows the OS setting until the user makes an explicit
 * choice, which is persisted in a "theme" cookie so the root layout can apply
 * it during SSR (no flash). The CSS in globals.css handles both cases.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(isDarkTheme());
    setMounted(true);

    // While the user hasn't made an explicit choice, keep following the OS.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!document.documentElement.getAttribute("data-theme")) setIsDark(mq.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
    setIsDark(next === "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
    >
      {/* Stable icon until mounted to avoid hydration mismatch. */}
      {mounted && isDark ? <Sun className="w-full h-full" /> : <Moon className="w-full h-full" />}
    </button>
  );
}
