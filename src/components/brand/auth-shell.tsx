"use client";

import { DnaHelix } from "./dna-helix";

/**
 * Shared full-page shell for the console-branded auth flows (login, setup-password):
 * animated brand gradient, floating blobs, decorative helix beside the card.
 * Ported from the Sales Drug Search Console's login.html/login.css.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center gap-10 px-5 py-8"
      style={{
        background: "linear-gradient(135deg, var(--color-brand-dark), var(--color-brand) 55%, #1b6b52)",
        backgroundSize: "220% 220%",
        animation: "brand-bg-shift 10s ease-in-out infinite",
      }}
    >
      <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-[50px] opacity-35"
          style={{
            width: 420, height: 420, top: -120, left: -100,
            background: "radial-gradient(circle, #7ee6b0, transparent 70%)",
            animation: "brand-float 16s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full blur-[50px] opacity-35"
          style={{
            width: 360, height: 360, bottom: -140, right: -80,
            background: "radial-gradient(circle, #a9c8ff, transparent 70%)",
            animation: "brand-float 19s ease-in-out infinite -4s",
          }}
        />
        <div
          className="absolute rounded-full blur-[50px] opacity-10"
          style={{
            width: 260, height: 260, top: "40%", right: "12%",
            background: "radial-gradient(circle, #ffffff, transparent 70%)",
            animation: "brand-float 13s ease-in-out infinite -7s",
          }}
        />
      </div>

      <div className="relative z-10">{children}</div>
      <DnaHelix className="hidden lg:block relative z-10" />
    </div>
  );
}
