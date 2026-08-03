"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, Users, BarChart2, Award, LogOut, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/instructor/courses", label: "My Courses", icon: BookOpen },
  { href: "/instructor/students", label: "Staff", icon: Users },
  { href: "/instructor/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/instructor/certificate-template", label: "Certificate", icon: Award },
];

interface NavProps {
  userName: string;
}

export function InstructorNav({ userName }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex flex-col h-full">
      <div
        className="px-4 py-5"
        style={{ background: "linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))" }}
      >
        <Link href="/instructor/dashboard" className="flex items-center gap-2 mb-3">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-white/95 shadow shrink-0">
            <img src="/logo.png" alt="" className="h-6 w-auto object-contain" />
          </span>
          <span className="font-bold text-white text-[15px] leading-tight">DNA Worldwide</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-white/85 hover:text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-full px-3 py-1 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to app
        </Link>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-brand-light text-brand"
                  : "text-ink-soft hover:bg-paper hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="px-3 py-4 border-t border-line">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-sm font-semibold text-brand">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{userName}</p>
            <p className="text-xs text-ink-faint">Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </nav>
  );
}
