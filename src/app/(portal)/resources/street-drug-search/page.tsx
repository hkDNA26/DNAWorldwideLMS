import { requireResourceAccess } from "@/lib/resource-access";
import { BackLink } from "@/components/portal/back-link";
import { StreetDrugSearch } from "@/components/portal/street-drug-search";

export default async function StreetDrugSearchPage() {
  await requireResourceAccess("STREET_DRUG_SEARCH");

  return (
    <div>
      <BackLink href="/resources" label="Back to resources" />
      <div className="mb-8 animate-brand-fade-up max-w-2xl">
        <h1 className="text-2xl font-bold text-ink">Drug Street Name Search</h1>
        <p className="text-ink-soft mt-2 leading-relaxed">
          Type a street/slang name to get the clinical or lab name, classification, how long effects typically last, and
          the serious risks involved — so a call can be translated into the right test panel.
        </p>
      </div>
      <StreetDrugSearch />
    </div>
  );
}
