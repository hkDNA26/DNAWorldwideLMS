import Link from "next/link";
import { BookOpen, Compass, LineChart, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";

const TILES = [
  {
    href: "/courses",
    icon: BookOpen,
    title: "Your Courses",
    description: "Pick up where you left off, or start something new.",
    color: "#1d4f8c",
    colorDark: "#0f3564",
  },
  {
    href: "/resources",
    icon: Compass,
    title: "Resources",
    description: "Drug search, panel pricing, and other staff tools.",
    color: "#0d9488",
    colorDark: "#0f766e",
  },
  {
    href: "/progress",
    icon: LineChart,
    title: "Progress & Settings",
    description: "Certificates, course progress, and your account.",
    color: "#d97706",
    colorDark: "#b45309",
  },
];

export default async function PortalHome() {
  const session = await getSession();
  const firstName = session?.name?.split(" ")[0] ?? "";

  return (
    <div>
      {/* Welcome hero — animated gradient with floating colour blobs */}
      <div
        className="relative overflow-hidden rounded-3xl mb-8 px-7 py-9"
        style={{
          background: "linear-gradient(135deg, var(--color-brand-dark), var(--color-brand) 55%, #0f766e)",
          backgroundSize: "200% 200%",
          animation: "brand-bg-shift 12s ease-in-out infinite",
        }}
      >
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute rounded-full blur-[40px] opacity-30"
            style={{
              width: 220, height: 220, top: -70, left: -50,
              background: "radial-gradient(circle, #7ee6b0, transparent 70%)",
              animation: "brand-float 14s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full blur-[40px] opacity-25"
            style={{
              width: 190, height: 190, bottom: -70, right: 60,
              background: "radial-gradient(circle, #ffd27e, transparent 70%)",
              animation: "brand-float 17s ease-in-out infinite -5s",
            }}
          />
          <div
            className="absolute rounded-full blur-[36px] opacity-20"
            style={{
              width: 140, height: 140, top: 10, right: 140,
              background: "radial-gradient(circle, #a9c8ff, transparent 70%)",
              animation: "brand-float 20s ease-in-out infinite -9s",
            }}
          />
        </div>

        <div className="relative animate-brand-fade-up">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Welcome back{firstName ? `, ${firstName}` : ""}
            <span
              className="inline-block"
              style={{ animation: "brand-mark-in 0.7s 0.2s cubic-bezier(0.22,1,0.36,1) both" }}
            >
              👋
            </span>
          </h1>
          <p className="text-white/75 mt-1">Where would you like to go?</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {TILES.map(({ href, icon: Icon, title, description, color, colorDark }, i) => (
          <Link
            key={href}
            href={href}
            className="group relative overflow-hidden bg-white border border-line rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all animate-brand-card-in"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {/* Large watermark vector icon, tinted to this tile's colour */}
            <Icon
              aria-hidden="true"
              className="absolute -right-5 -bottom-5 w-32 h-32 opacity-[0.06] group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-300"
              style={{ color }}
              strokeWidth={1.5}
            />

            <div
              className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-sm group-hover:scale-110 transition-transform duration-300"
              style={{ background: `linear-gradient(135deg, ${color}, ${colorDark})` }}
            >
              <Icon className="w-6 h-6" />
            </div>

            <h2 className="relative text-[15px] font-bold text-ink mb-1.5 flex items-center gap-1.5">
              {title}
              <ArrowRight
                className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                style={{ color }}
              />
            </h2>
            <p className="relative text-[13.5px] text-ink-soft leading-relaxed">{description}</p>

            {/* Coloured accent bar that sweeps in on hover */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
              style={{ background: `linear-gradient(90deg, ${color}, ${colorDark})` }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
