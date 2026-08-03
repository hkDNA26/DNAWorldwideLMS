import { FlaskConical, Beer, type LucideIcon } from "lucide-react";
import type { ResourceKey } from "@/generated/prisma/enums";

interface ResourceDef {
  key: ResourceKey;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export const RESOURCES: ResourceDef[] = [
  {
    key: "DRUG_SEARCH",
    label: "Sales Drug Search Console",
    description:
      "Find the cheapest panel combination for any set of drugs, plus panel, blood, urine, medication and question-set lookups.",
    icon: FlaskConical,
    href: "/resources/drug-search",
  },
  {
    key: "ALCOHOL_CALCULATOR",
    label: "Alcohol Unit Calculator",
    description: "Calculate UK alcohol units for any drink, serving size and strength.",
    icon: Beer,
    href: "/resources/alcohol-calculator",
  },
];

export function getResource(key: ResourceKey) {
  const resource = RESOURCES.find((r) => r.key === key);
  if (!resource) throw new Error(`Unknown resource: ${key}`);
  return resource;
}
