import { FlaskConical, Beer, Clapperboard, Users, Globe2, SearchCheck, type LucideIcon } from "lucide-react";
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
  {
    key: "VIDEOS",
    label: "Videos",
    description: "Training films and drug-profile videos to watch on demand.",
    icon: Clapperboard,
    href: "/resources/videos",
  },
  {
    key: "COLLECTORS",
    label: "Collector Profiles",
    description: "Find our sample collectors by area, training or on the map.",
    icon: Users,
    href: "/resources/collectors",
  },
  {
    key: "CLINICS",
    label: "Global Clinic Locations",
    description: "Browse our partner clinics worldwide by country, continent or map.",
    icon: Globe2,
    href: "/resources/clinics",
  },
  {
    key: "STREET_DRUG_SEARCH",
    label: "Drug Street Name Search",
    description: "Type a street name to get the clinical name, classification, duration and risks.",
    icon: SearchCheck,
    href: "/resources/street-drug-search",
  },
];

export function getResource(key: ResourceKey) {
  const resource = RESOURCES.find((r) => r.key === key);
  if (!resource) throw new Error(`Unknown resource: ${key}`);
  return resource;
}
