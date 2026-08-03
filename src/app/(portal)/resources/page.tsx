import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getResourceAccessMap } from "@/lib/resource-access";
import { RESOURCES } from "@/lib/resources";
import { BackLink } from "@/components/portal/back-link";

export default async function ResourcesPage() {
  const session = await getSession();
  if (!session) return null;

  const access = await getResourceAccessMap(session.userId, session.role === "ADMIN");
  const grantedResources = RESOURCES.filter((resource) => access[resource.key] === "GRANTED");

  return (
    <div>
      <BackLink href="/" label="Back to home" />
      <div className="mb-8 animate-brand-fade-up">
        <h1 className="text-2xl font-bold text-ink">Resources</h1>
        <p className="text-ink-soft mt-1">Staff tools for day-to-day sales and testing questions.</p>
      </div>

      {grantedResources.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-8 text-center text-ink-faint text-sm">
          You don't have access to any resources yet. Ask your admin to grant you access.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {grantedResources.map((resource, i) => {
            const Icon = resource.icon;
            return (
              <Link
                key={resource.key}
                href={resource.href}
                className="group bg-white border border-line rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all animate-brand-card-in"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center mb-4 group-hover:bg-brand group-hover:text-white text-brand transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-[15px] font-bold text-ink mb-1.5 flex items-center gap-2">
                  {resource.label}
                  <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h2>
                <p className="text-[13.5px] text-ink-soft leading-relaxed">{resource.description}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
