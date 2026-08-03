import { DrugChipSearch } from "@/components/drug-search/drug-chip-search";
import { PanelSearch } from "@/components/drug-search/panel-search";
import { BloodSearch, UrineSearch, QuestionSetSearch } from "@/components/drug-search/simple-select-tools";
import { MedicationSearch } from "@/components/drug-search/medication-search";
import { BrowseAllPanels } from "@/components/drug-search/browse-all-panels";
import { BackLink } from "@/components/portal/back-link";
import { requireResourceAccess } from "@/lib/resource-access";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-wide text-brand mb-3">
      <span className="inline-block w-[18px] h-[2px] bg-accent" />
      {children}
    </h2>
  );
}

export default async function DrugSearchPage() {
  await requireResourceAccess("DRUG_SEARCH");

  return (
    <div>
      <BackLink href="/resources" label="Back to Resources" />

      <SectionHeading>Most suitable testing product</SectionHeading>
      <div className="mb-8">
        <DrugChipSearch />
      </div>

      <hr className="border-line my-9" />

      <SectionHeading>Additional information and searches</SectionHeading>
      <PanelSearch />
      <BloodSearch />
      <UrineSearch />
      <MedicationSearch />
      <QuestionSetSearch />

      <BrowseAllPanels />
    </div>
  );
}
