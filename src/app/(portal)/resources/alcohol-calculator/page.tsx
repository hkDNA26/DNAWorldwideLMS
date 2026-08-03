import { BackLink } from "@/components/portal/back-link";
import { requireResourceAccess } from "@/lib/resource-access";
import { AlcoholCalculator } from "@/components/alcohol-calculator/calculator";

export default async function AlcoholCalculatorPage() {
  await requireResourceAccess("ALCOHOL_CALCULATOR");

  return (
    <div>
      <BackLink href="/resources" label="Back to Resources" />
      <div className="mb-8 animate-brand-fade-up">
        <h1 className="text-2xl font-bold text-ink">Alcohol Unit Calculator</h1>
        <p className="text-ink-soft mt-1">
          Work out UK alcohol units for any drink, serving size and strength.
        </p>
      </div>
      <AlcoholCalculator />
    </div>
  );
}
