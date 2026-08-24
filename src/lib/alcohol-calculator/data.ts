import { Beer, GlassWater, Wine, BottleWine, Martini, CupSoda, type LucideIcon } from "lucide-react";

export interface ServingPreset {
  label: string;
  ml: number;
}

export interface DrinkType {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  defaultAbv: number;
  servings: ServingPreset[];
}

// Colors are used as a light background tint behind each drink's icon chip.
export const DRINK_TYPES: DrinkType[] = [
  {
    key: "BEER_LAGER",
    label: "Beer & Lager",
    icon: Beer,
    color: "#f2b705",
    defaultAbv: 4.5,
    servings: [
      { label: "Half pint (284ml)", ml: 284 },
      { label: "Pint (568ml)", ml: 568 },
      { label: "Bottle (330ml)", ml: 330 },
      { label: "Can (440ml)", ml: 440 },
    ],
  },
  {
    key: "CIDER",
    label: "Cider",
    icon: GlassWater,
    color: "#c9a441",
    defaultAbv: 4.5,
    servings: [
      { label: "Half pint (284ml)", ml: 284 },
      { label: "Pint (568ml)", ml: 568 },
      { label: "Bottle (500ml)", ml: 500 },
    ],
  },
  {
    key: "WINE",
    label: "Wine",
    icon: Wine,
    color: "#8c2f4b",
    defaultAbv: 12.5,
    servings: [
      { label: "Small glass (125ml)", ml: 125 },
      { label: "Standard glass (175ml)", ml: 175 },
      { label: "Large glass (250ml)", ml: 250 },
      { label: "Bottle (750ml)", ml: 750 },
    ],
  },
  {
    key: "CHAMPAGNE",
    label: "Champagne & Prosecco",
    icon: BottleWine,
    color: "#c99a2e",
    defaultAbv: 12,
    servings: [
      { label: "Flute (125ml)", ml: 125 },
      { label: "Bottle (750ml)", ml: 750 },
    ],
  },
  {
    key: "SPIRITS",
    label: "Spirits",
    icon: Martini,
    color: "#3568ad",
    defaultAbv: 40,
    servings: [
      { label: "Single shot (25ml)", ml: 25 },
      { label: "Large single (35ml)", ml: 35 },
      { label: "Double shot (50ml)", ml: 50 },
    ],
  },
  {
    key: "ALCOPOPS",
    label: "Alcopops & RTDs",
    icon: CupSoda,
    color: "#2e8659",
    defaultAbv: 4.5,
    servings: [{ label: "Bottle (275ml)", ml: 275 }],
  },
];

// UK CMO standard formula: units = (ABV% x volume in ml) / 1000
export function calculateUnits(abv: number, ml: number): number {
  return (abv * ml) / 1000;
}

// UK Chief Medical Officers' low-risk drinking guideline.
export const WEEKLY_UNIT_GUIDELINE = 14;

// WHO daily alcohol-consumption thresholds (World Health Organization survey).
// "Excessive" is defined as reaching this many units of ethanol per day.
export type Sex = "men" | "women";

export const WHO_THRESHOLDS: Record<Sex, { excessiveUnits: number; excessiveGrams: number }> = {
  men: { excessiveUnits: 7.5, excessiveGrams: 60 },
  women: { excessiveUnits: 5, excessiveGrams: 40 },
};

// A 30-day month, used to translate the WHO daily "excessive" threshold into a monthly
// reference figure — useful when interpreting a segmented hair test (~1 month/cm).
export const MONTHLY_DAYS = 30;

export const WHO_MONTHLY_THRESHOLDS: Record<Sex, { excessiveUnits: number; excessiveGrams: number }> = {
  men: {
    excessiveUnits: WHO_THRESHOLDS.men.excessiveUnits * MONTHLY_DAYS,
    excessiveGrams: WHO_THRESHOLDS.men.excessiveGrams * MONTHLY_DAYS,
  },
  women: {
    excessiveUnits: WHO_THRESHOLDS.women.excessiveUnits * MONTHLY_DAYS,
    excessiveGrams: WHO_THRESHOLDS.women.excessiveGrams * MONTHLY_DAYS,
  },
};

export type WhoLevel = "abstinence" | "occasional" | "excessive";

/** Classify a day's total units against the WHO thresholds for the given sex. */
export function whoLevel(units: number, sex: Sex): WhoLevel {
  if (units <= 0) return "abstinence";
  if (units >= WHO_THRESHOLDS[sex].excessiveUnits) return "excessive";
  return "occasional";
}
