import { PANELS, type Panel } from "./data";

export interface ActivePanel {
  name: string;
  price: number;
  isPerDrug: boolean;
  covered: string[];
}

export type CheapestComboResult =
  | { status: "empty" }
  | { status: "missing"; missing: string[]; targetDrugs: string[] }
  | { status: "ok"; combo: ActivePanel[]; price: number; targetDrugs: string[] };

/**
 * Ported 1:1 from the console's OPTIMAL_PANELS Apps Script function (via its
 * JS port in app.js): substring-matches each requested drug against every
 * panel's full lowercased description text, then recursively searches
 * combinations (depth-capped at 4) for the cheapest set that covers every
 * requested drug, treating "Specific drug testing" panels as priced per
 * uncovered drug rather than as a flat panel fee.
 */
export function findCheapestCombo(targetDrugsInput: string[], panels: Panel[] = PANELS): CheapestComboResult {
  const targetDrugs = targetDrugsInput
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d.length > 0);

  if (targetDrugs.length === 0) return { status: "empty" };

  const activePanels: ActivePanel[] = [];
  panels.forEach((p) => {
    const covered = targetDrugs.filter((d) => p.rawLower.indexOf(d) !== -1);
    if (covered.length > 0) {
      activePanels.push({ name: p.name, price: p.price, isPerDrug: p.isPerDrug, covered });
    }
  });

  let bestCombo: ActivePanel[] | null = null;
  let lowestPrice = Infinity;

  function getUncovered(combo: ActivePanel[], targets: string[]): string[] {
    const coveredSet: Record<string, boolean> = {};
    combo.forEach((c) => c.covered.forEach((d) => { coveredSet[d] = true; }));
    return targets.filter((t) => !coveredSet[t]);
  }

  function getPrice(combo: ActivePanel[], targets: string[]): number {
    let standardCost = 0;
    const coveredByStandard: Record<string, boolean> = {};
    const perDrugPanels: ActivePanel[] = [];

    combo.forEach((c) => {
      if (!c.isPerDrug) {
        standardCost += c.price;
        c.covered.forEach((d) => { coveredByStandard[d] = true; });
      } else {
        perDrugPanels.push(c);
      }
    });

    let perDrugCost = 0;
    targets.forEach((d) => {
      if (!coveredByStandard[d]) {
        let cheapest = Infinity;
        perDrugPanels.forEach((p) => {
          if (p.covered.indexOf(d) !== -1 && p.price < cheapest) cheapest = p.price;
        });
        if (cheapest !== Infinity) perDrugCost += cheapest;
      }
    });

    return standardCost + perDrugCost;
  }

  function search(startIndex: number, currentCombo: ActivePanel[]) {
    const uncovered = getUncovered(currentCombo, targetDrugs);
    if (uncovered.length === 0) {
      const price = getPrice(currentCombo, targetDrugs);
      if (price < lowestPrice) {
        lowestPrice = price;
        bestCombo = currentCombo.slice();
      }
      return;
    }
    if (currentCombo.length >= 4) return; // matches the original depth cap

    for (let i = startIndex; i < activePanels.length; i++) {
      const addsValue = activePanels[i].covered.some((d) => uncovered.indexOf(d) !== -1);
      if (addsValue) {
        currentCombo.push(activePanels[i]);
        search(i + 1, currentCombo);
        currentCombo.pop();
      }
    }
  }

  search(0, []);

  if (bestCombo === null) {
    const allUncovered = getUncovered(activePanels, targetDrugs);
    return { status: "missing", missing: allUncovered, targetDrugs };
  }

  return { status: "ok", combo: bestCombo, price: lowestPrice, targetDrugs };
}

/**
 * Ported from the console's "Included in" lookup for medication brand search:
 * only checks the "standard" (non per-drug) panels, and requires every
 * comma-split term in the active ingredient to be present in a panel's text.
 */
export function includedInPanels(activeIngredient: string, panels: Panel[] = PANELS): string[] {
  const terms = activeIngredient
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (terms.length === 0) return [];

  return panels
    .filter((p) => !p.isPerDrug)
    .filter((p) => terms.every((t) => p.rawLower.indexOf(t) !== -1))
    .map((p) => p.name);
}
