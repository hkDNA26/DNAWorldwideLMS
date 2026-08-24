export interface CollectorItem {
  id: string;
  name: string;
  area: string;
  inTraining: boolean;
  employment: string | null;
  livesOutcode: string | null;
  covers: string | null;
  capabilities: string[];
  avgAppTime: string | null;
  notes: string | null;
  photoUrl: string | null;
  lat: number | null;
  lng: number | null;
}

/** Ordered capability keys → labels, matching the training taxonomy. */
export const CAPABILITY_LABELS: Record<string, string> = {
  head_hair: "Head hair",
  body_hair: "Body hair",
  nails: "Nails",
  dna: "DNA",
  venipuncture: "Venipuncture",
  dried_blood: "Dried blood",
  urine: "Urine",
  saliva: "Saliva",
  scram: "SCRAM",
  breath: "Breath",
};

/** The capabilities offered as filter chips, in display order. */
export const FILTER_CAPABILITIES = [
  "head_hair",
  "body_hair",
  "nails",
  "dna",
  "venipuncture",
  "dried_blood",
  "urine",
  "saliva",
  "scram",
] as const;

/** The "fully trained" tier: all core sample types plus urine and saliva. */
export const FULLY_TRAINED_CAPS = [
  "head_hair",
  "body_hair",
  "nails",
  "dna",
  "venipuncture",
  "dried_blood",
  "urine",
  "saliva",
];

export function isFullyTrained(caps: string[]): boolean {
  const set = new Set(caps);
  return FULLY_TRAINED_CAPS.every((c) => set.has(c));
}

export function capabilityLabel(key: string): string {
  return CAPABILITY_LABELS[key] ?? key;
}
