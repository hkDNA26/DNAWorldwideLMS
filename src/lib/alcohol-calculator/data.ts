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
