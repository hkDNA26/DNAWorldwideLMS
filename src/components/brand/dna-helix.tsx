"use client";

/**
 * Decorative animated double-helix, ported from the Sales Drug Search Console's
 * login page. Purely visual (aria-hidden) — twisting base pairs built from
 * staggered `dna-twist` keyframe delays (defined in globals.css).
 */
export function DnaHelix({ rungCount = 16, className = "" }: { rungCount?: number; className?: string }) {
  const rungs = Array.from({ length: rungCount }, (_, i) => i);

  return (
    <div
      aria-hidden="true"
      className={`relative w-[70px] h-[320px] opacity-40 ${className}`}
    >
      {rungs.map((i) => (
        <div
          key={i}
          className="absolute left-0 right-0 h-[2px] flex items-center justify-between"
          style={{
            top: `${i * 20}px`,
            animationName: "dna-twist",
            animationDuration: "7s",
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${i * -0.45}s`,
          }}
        >
          <span
            aria-hidden="true"
            className="absolute left-[9px] right-[9px] top-1/2 h-px -translate-y-1/2"
            style={{ background: "rgba(255,255,255,0.35)" }}
          />
          <span className="w-[9px] h-[9px] rounded-full bg-white relative z-10" style={{ boxShadow: "0 0 8px rgba(255,255,255,0.5)" }} />
          <span className="w-[9px] h-[9px] rounded-full bg-accent relative z-10" style={{ boxShadow: "0 0 8px rgba(255,255,255,0.5)" }} />
        </div>
      ))}
    </div>
  );
}
