export type DrugClass =
  | "Stimulant"
  | "Depressant"
  | "Opioid"
  | "Hallucinogen"
  | "Dissociative"
  | "Cannabinoid"
  | "Synthetic Cannabinoid"
  | "Empathogen"
  | "Inhalant"
  | "Other";

export interface StreetDrug {
  slug: string;
  /** Clinical / laboratory name, as used on a test panel or toxicology report. */
  clinicalName: string;
  /** Common UK street/slang names — what a caller or donor is likely to actually say. */
  streetNames: string[];
  classification: DrugClass;
  durationOfEffects: string;
  risks: string;
  /** What it's commonly cut/bulked/substituted with on the UK illicit market. */
  commonlyMixedWith: string;
  /** Rough, indicative UK street price — varies hugely by region/purity/supplier. */
  ukStreetPrice?: string;
  /** Wikipedia lookup title used to source a reference image (fetched separately). */
  wikiTitle: string;
  imageUrl?: string | null;
}

// Curated reference set covering the substances most often reported to collectors/sales
// under a street name. Clinical names align with the panels in the Drug Search Console.
// Content is written for professional/testing-context reference — not a usage guide.
export const STREET_DRUGS: StreetDrug[] = [
  {
    slug: "cannabis",
    clinicalName: "Cannabis (Tetrahydrocannabinol / THC)",
    streetNames: ["Weed", "Grass", "Marijuana", "Ganja", "Pot", "Bud", "Skunk", "Hash", "Dope", "Green"],
    classification: "Cannabinoid",
    durationOfEffects: "1–4 hours (smoked); up to 6–8 hours if eaten",
    risks:
      "Impaired coordination and short-term memory, anxiety or paranoia, increased psychosis risk with early/heavy use, and dependency with regular use.",
    commonlyMixedWith:
      "Rarely chemically \"cut\", but weight can be bulked with sugar/glucose syrup, or cheaper herbal material can be sprayed with synthetic cannabinoids to fake higher potency.",
    ukStreetPrice: "£8–£12/g (herbal), £5–£10/g (resin)",
    wikiTitle: "Cannabis (drug)",
    imageUrl: "/uploads/street-drugs/cannabis.jpg?v=18e4ad77",
  },
  {
    slug: "cocaine",
    clinicalName: "Cocaine (Cocaine hydrochloride)",
    streetNames: ["Coke", "Charlie", "Snow", "Blow", "Toot", "Gak", "Bump", "Powder"],
    classification: "Stimulant",
    durationOfEffects: "20–30 minutes per dose (snorted); often re-dosed over hours",
    risks:
      "Cardiac arrhythmia, heart attack or stroke even in young/fit users, severe psychological dependency, aggression, and nasal septum damage with regular snorting.",
    commonlyMixedWith:
      "Levamisole (a veterinary dewormer, very common recent adulterant), benzocaine or lidocaine (mimic the numbing effect), caffeine, creatine, boric acid and paracetamol as bulking agents.",
    ukStreetPrice: "£40–£80/g",
    wikiTitle: "Cocaine",
    imageUrl: "/uploads/street-drugs/cocaine.jpg?v=7df0bf81",
  },
  {
    slug: "crack-cocaine",
    clinicalName: "Crack Cocaine (Cocaine base)",
    streetNames: ["Crack", "Rock", "Stone", "Base"],
    classification: "Stimulant",
    durationOfEffects: "5–10 minutes — very short and intense",
    risks:
      "Extremely high dependency potential, acute cardiac events, paranoia and psychosis, and respiratory damage from smoking.",
    commonlyMixedWith:
      "Made by cooking powder cocaine with baking soda/ammonia, so it usually inherits whatever the source powder was cut with (levamisole, benzocaine, caffeine).",
    ukStreetPrice: "£10–£20 per rock (~0.1–0.2g)",
    wikiTitle: "Crack cocaine",
    imageUrl: "/uploads/street-drugs/crack-cocaine.jpg?v=5e7f3a79",
  },
  {
    slug: "heroin",
    clinicalName: "Heroin (Diamorphine)",
    streetNames: ["Smack", "Brown", "Gear", "H", "Skag", "Horse"],
    classification: "Opioid",
    durationOfEffects: "3–5 hours",
    risks:
      "High risk of fatal overdose (respiratory depression), especially combined with alcohol or benzodiazepines. Severe physical dependency, blood-borne virus risk from injecting, and collapsed veins.",
    commonlyMixedWith:
      "Classically paracetamol and caffeine, but increasingly cut with far more potent synthetic opioids such as fentanyl or nitazenes — now a leading driver of fatal overdoses.",
    ukStreetPrice: "£10–£20 per bag (~0.1–0.2g)",
    wikiTitle: "Heroin",
    imageUrl: "/uploads/street-drugs/heroin.jpg?v=de2161ff",
  },
  {
    slug: "calvin-klein",
    clinicalName: "Cocaine + Ketamine (combined use)",
    streetNames: ["Calvin Klein", "CK", "CK1"],
    classification: "Other",
    durationOfEffects: "Effects overlap and mask each other — commonly 1–3 hours, often redosed",
    risks:
      "Combining a stimulant with a dissociative masks each drug's warning signs — cocaine's alertness can hide ketamine's loss of coordination, encouraging more use of both. Significant added cardiovascular strain, higher risk of accidental injury, and an unpredictable combined effect.",
    commonlyMixedWith:
      "By definition a user-made mix of cocaine and ketamine (named after the CK One fragrance) — each component still carries its own separate cutting-agent risks; see the Cocaine and Ketamine entries.",
    wikiTitle: "Polysubstance use",
    imageUrl: null,
  },
  {
    slug: "mdma",
    clinicalName: "MDMA (3,4-Methylenedioxymethamphetamine)",
    streetNames: ["Ecstasy", "Molly", "Mandy", "Pills", "E", "Ecky"],
    classification: "Empathogen",
    durationOfEffects: "3–6 hours",
    risks:
      "Hyperthermia and dehydration, dangerously low blood sodium (hyponatraemia) from overhydration, serotonin syndrome, cardiac strain, and a pronounced low-mood \"comedown\".",
    commonlyMixedWith:
      "Pills and powder increasingly contain little or no genuine MDMA and instead PMA/PMMA (far more toxic substitutes), amphetamine, caffeine or other novel stimulants.",
    ukStreetPrice: "£3–£10/pill, £30–£50/g",
    wikiTitle: "MDMA",
    imageUrl: "/uploads/street-drugs/mdma.jpg?v=6149c88a",
  },
  {
    slug: "amphetamine",
    clinicalName: "Amphetamine (Amphetamine sulphate)",
    streetNames: ["Speed", "Whizz", "Billy", "Sulph", "Uppers"],
    classification: "Stimulant",
    durationOfEffects: "4–6 hours",
    risks:
      "Cardiovascular strain, insomnia, anxiety or paranoia, dependency, and an exhausting \"comedown\" period.",
    commonlyMixedWith:
      "Heavily bulked with caffeine, glucose/sugar or paracetamol — genuine amphetamine content in UK street \"speed\" is often under 10%.",
    ukStreetPrice: "£10–£15/g",
    wikiTitle: "Amphetamine",
    imageUrl: "/uploads/street-drugs/amphetamine.jpg?v=0df52624",
  },
  {
    slug: "methamphetamine",
    clinicalName: "Methamphetamine",
    streetNames: ["Crystal Meth", "Meth", "Tina", "Crystal", "Ice"],
    classification: "Stimulant",
    durationOfEffects: "6–12 hours — notably long compared to other stimulants",
    risks:
      "Severe dependency, dental damage (\"meth mouth\"), cardiovascular damage, psychosis, and compulsive skin-picking.",
    commonlyMixedWith:
      "Usually sold as high-purity crystal so less cut than other stimulants, but powder forms can contain MSM (methylsulfonylmethane) or caffeine.",
    ukStreetPrice: "£60–£100/g (less common in the UK than elsewhere)",
    wikiTitle: "Methamphetamine",
    imageUrl: "/uploads/street-drugs/methamphetamine.jpg?v=7b3702bd",
  },
  {
    slug: "ketamine",
    clinicalName: "Ketamine (Ketamine hydrochloride)",
    streetNames: ["Ket", "Special K", "K", "Vitamin K"],
    classification: "Dissociative",
    durationOfEffects: "1–2 hours",
    risks:
      "Loss of coordination and awareness (the \"K-hole\"), significant injury risk while dissociated, and severe bladder damage (\"ketamine bladder\") with regular use.",
    commonlyMixedWith: "Caffeine or benzocaine, and sometimes combined with MDMA or other powders at the point of use.",
    ukStreetPrice: "£20–£40/g",
    wikiTitle: "Ketamine",
    imageUrl: "/uploads/street-drugs/ketamine.jpg?v=9fe0c9d3",
  },
  {
    slug: "ghb-gbl",
    clinicalName: "GHB / GBL (Gamma-hydroxybutyrate / Gamma-butyrolactone)",
    streetNames: ["G", "Liquid Ecstasy", "Gina"],
    classification: "Depressant",
    durationOfEffects: "1.5–3 hours",
    risks:
      "A very narrow margin between an effective dose and an overdose; high risk of sudden unconsciousness or coma, particularly fatal when mixed with alcohol. Also associated with drug-facilitated assault.",
    commonlyMixedWith:
      "Rarely adulterated chemically (it's a liquid, harder to cut invisibly), but concentration is highly inconsistent between batches — which functions like an unpredictable \"cut\" in itself.",
    ukStreetPrice: "£10–£20 per small bottle",
    wikiTitle: "Gamma-Hydroxybutyric acid",
    imageUrl: "/uploads/street-drugs/ghb-gbl.jpg?v=c361fcf6",
  },
  {
    slug: "lsd",
    clinicalName: "LSD (Lysergic acid diethylamide)",
    streetNames: ["Acid", "Tabs", "Trips", "Blotters"],
    classification: "Hallucinogen",
    durationOfEffects: "8–12 hours",
    risks:
      "Unpredictable and intense psychological effects; \"bad trips\" can cause panic and injury, and it can trigger underlying mental health conditions. Low direct physical toxicity.",
    commonlyMixedWith:
      "Blotter tabs occasionally contain NBOMe compounds sold as LSD instead (far more dangerous), and dose per tab varies considerably between batches.",
    ukStreetPrice: "£3–£10 per tab",
    wikiTitle: "Lysergic acid diethylamide",
    imageUrl: "/uploads/street-drugs/lsd.jpg?v=8fd77710",
  },
  {
    slug: "magic-mushrooms",
    clinicalName: "Psilocybin (Magic Mushrooms)",
    streetNames: ["Shrooms", "Mushies", "Liberty Caps"],
    classification: "Hallucinogen",
    durationOfEffects: "4–6 hours",
    risks:
      "Nausea, disorientation, panic reactions, injury risk from impaired judgement, and the potential to trigger psychosis in vulnerable individuals.",
    commonlyMixedWith:
      "Not typically \"cut\", but dried/powdered products can be substituted with other, sometimes toxic, mushroom species that are hard to tell apart once processed.",
    ukStreetPrice: "Highly variable — often foraged, or ~£10–£20 for a dried batch",
    wikiTitle: "Psilocybin mushroom",
    imageUrl: "/uploads/street-drugs/magic-mushrooms.jpg?v=8c5a2385",
  },
  {
    slug: "diazepam-benzos",
    clinicalName: "Diazepam and other prescription Benzodiazepines",
    streetNames: ["Benzos", "Vallies", "Blues", "Diazzies"],
    classification: "Depressant",
    durationOfEffects: "4–8 hours (varies by specific drug)",
    risks:
      "Profound respiratory depression when combined with opioids or alcohol; high dependency potential with withdrawal that can itself be life-threatening; sedation impairing coordination.",
    commonlyMixedWith:
      "Street tablets are frequently counterfeit, containing no diazepam at all but far more dangerous designer benzodiazepines instead.",
    ukStreetPrice: "£1–£3 per tablet",
    wikiTitle: "Diazepam",
    imageUrl: "/uploads/street-drugs/diazepam-benzos.jpg?v=d5a82c56",
  },
  {
    slug: "etizolam",
    clinicalName: "Etizolam (\"street benzo\")",
    streetNames: ["Etis", "Street Benzos"],
    classification: "Depressant",
    durationOfEffects: "4–8 hours",
    risks:
      "Extremely high overdose risk, especially combined with opioids. One of the substances most frequently implicated in UK drug-related deaths in recent years, with severe withdrawal.",
    commonlyMixedWith:
      "Sold in bulk illicit tablet form with highly inconsistent dosing between batches — that inconsistency is itself a major driver of overdose risk.",
    ukStreetPrice: "£0.50–£1 per tablet",
    wikiTitle: "Etizolam",
    imageUrl: "/uploads/street-drugs/etizolam.jpg?v=aea06e9e",
  },
  {
    slug: "mephedrone",
    clinicalName: "Mephedrone (4-Methylmethcathinone)",
    streetNames: ["Meow Meow", "MCAT", "Drone"],
    classification: "Stimulant",
    durationOfEffects: "1–2 hours — short, often leading to repeated redosing",
    risks:
      "Cardiovascular strain, compulsive redosing, agitation and paranoia, and cold/discoloured extremities.",
    commonlyMixedWith: "Caffeine, other synthetic cathinones, or benzocaine.",
    ukStreetPrice: "£10–£20/g",
    wikiTitle: "Mephedrone",
    imageUrl: "/uploads/street-drugs/mephedrone.jpg?v=5788f0a2",
  },
  {
    slug: "monkey-dust",
    clinicalName: "MDPV (Methylenedioxypyrovalerone)",
    streetNames: ["Monkey Dust", "White Dove"],
    classification: "Stimulant",
    durationOfEffects: "Several hours, and can extend over days with repeated dosing",
    risks:
      "Severe agitation, paranoia and psychosis, dangerously elevated body temperature, and association with erratic, high-risk behaviour that is difficult to de-escalate once symptomatic.",
    commonlyMixedWith:
      "Frequently sold mixed with, or substituted for, other synthetic cathinones or synthetic cannabinoids, making effects highly unpredictable.",
    ukStreetPrice: "Very cheap — often £2–£5 per hit",
    wikiTitle: "Methylenedioxypyrovalerone",
    imageUrl: "/uploads/street-drugs/monkey-dust.jpg?v=ab65c906",
  },
  {
    slug: "spice",
    clinicalName: "Synthetic Cannabinoids",
    streetNames: ["Spice", "Mamba", "Black Mamba", "Clockwork Orange"],
    classification: "Synthetic Cannabinoid",
    durationOfEffects: "Highly variable — minutes to several hours",
    risks:
      "Unpredictable potency causes frequent hospitalisation; seizures, cardiac events, psychosis, and severe dependency, particularly among homeless populations and in prisons.",
    commonlyMixedWith:
      "The synthetic compound is sprayed onto plant material at inconsistent, sometimes dangerously high concentrations — batch-to-batch potency variation is itself the main risk.",
    ukStreetPrice: "Very cheap — £5–£10/g",
    wikiTitle: "Synthetic cannabinoids",
    imageUrl: "/uploads/street-drugs/spice.jpg?v=796b0733",
  },
  {
    slug: "nitrous-oxide",
    clinicalName: "Nitrous Oxide",
    streetNames: ["NOS", "Laughing Gas", "Balloons", "Whippets"],
    classification: "Inhalant",
    durationOfEffects: "Seconds to a couple of minutes per inhalation",
    risks:
      "Vitamin B12 depletion and nerve damage with regular heavy use, loss of consciousness and fall risk, frostbite from direct canister contact, and asphyxiation risk in confined spaces. Illegal to supply for recreational use in the UK since 2023.",
    commonlyMixedWith: "Occasionally sold in canisters containing other propellant gases or oxygen mixes rather than pure N2O.",
    ukStreetPrice: "£3–£5 per large canister/balloon",
    wikiTitle: "Nitrous oxide",
    imageUrl: "/uploads/street-drugs/nitrous-oxide.jpg?v=07071ba6",
  },
  {
    slug: "poppers",
    clinicalName: "Alkyl Nitrites",
    streetNames: ["Poppers"],
    classification: "Inhalant",
    durationOfEffects: "A few minutes",
    risks:
      "Sudden drop in blood pressure and fainting, dangerous interaction with erectile-dysfunction medication, eye damage with prolonged use, and chemical burns if spilled on skin.",
    commonlyMixedWith:
      "Formulations vary by chemical type (amyl, isopropyl, isobutyl nitrite) with differing potency — mislabelling between these types is common.",
    ukStreetPrice: "£5–£10 per bottle",
    wikiTitle: "Alkyl nitrites",
    imageUrl: "/uploads/street-drugs/poppers.jpg?v=82b1e3dd",
  },
  {
    slug: "dmt",
    clinicalName: "DMT (N,N-Dimethyltryptamine)",
    streetNames: ["Dimitri", "The Businessman's Trip"],
    classification: "Hallucinogen",
    durationOfEffects: "5–15 minutes — very short and intense",
    risks:
      "Overwhelming psychological effects, sharply increased heart rate and blood pressure, and significant injury risk from complete loss of awareness of surroundings during use.",
    commonlyMixedWith: "Sometimes combined with other tryptamines, or plant-material extracts of inconsistent strength.",
    wikiTitle: "Dimethyltryptamine",
    imageUrl: "/uploads/street-drugs/dmt.jpg?v=e9d8520d",
  },
  {
    slug: "2c-b",
    clinicalName: "2C-B (4-Bromo-2,5-dimethoxyphenethylamine)",
    streetNames: ["2C-B", "Nexus", "Tucibi"],
    classification: "Hallucinogen",
    durationOfEffects: "4–8 hours",
    risks:
      "Unpredictable dose-response — small differences in amount taken cause large differences in effect — plus anxiety, elevated heart rate and nausea.",
    commonlyMixedWith:
      "Frequently sold as, or alongside, other more dangerous NBOMe or 2C-series compounds due to their visual similarity.",
    ukStreetPrice: "£10–£20 per pill/gram",
    wikiTitle: "2C-B",
    imageUrl: "/uploads/street-drugs/2c-b.jpg?v=83300fd2",
  },
  {
    slug: "xanax",
    clinicalName: "Alprazolam (often counterfeit street tablets)",
    streetNames: ["Xanax", "Xannies", "Bars", "Zannies"],
    classification: "Depressant",
    durationOfEffects: "4–6 hours",
    risks:
      "Street tablets are frequently counterfeit and can contain far stronger substances than expected. Major overdose risk especially with opioids or alcohol, and high dependency potential.",
    commonlyMixedWith:
      "Very often contain no genuine alprazolam at all — counterfeit \"bars\" frequently contain potent designer benzodiazepines instead.",
    ukStreetPrice: "£1–£3 per tablet",
    wikiTitle: "Alprazolam",
    imageUrl: "/uploads/street-drugs/xanax.jpg?v=c748e46d",
  },
  {
    slug: "fentanyl-nitazenes",
    clinicalName: "Fentanyl / Nitazenes (synthetic opioids)",
    streetNames: ["Fentanyl", "Fenty"],
    classification: "Opioid",
    durationOfEffects: "Variable, often shorter-acting than heroin",
    risks:
      "Extremely potent — a small dosing error can be fatal. Increasingly found mixed into heroin and counterfeit prescription pills in the UK, and a major driver of rising overdose deaths; can require higher naloxone doses to reverse.",
    commonlyMixedWith:
      "Used themselves as adulterants in heroin and counterfeit prescription pills; also bulked with agents like mannitol or lactose.",
    wikiTitle: "Fentanyl",
    imageUrl: "/uploads/street-drugs/fentanyl-nitazenes.jpg?v=e2b43e59",
  },
  {
    slug: "oxycodone",
    clinicalName: "Oxycodone (diverted prescription opioid)",
    streetNames: ["Oxy", "OC", "Kickers"],
    classification: "Opioid",
    durationOfEffects: "4–6 hours (immediate release)",
    risks:
      "Respiratory depression, high dependency potential, and counterfeit tablets increasingly contain fentanyl or nitazenes. Dangerous combined with alcohol.",
    commonlyMixedWith: "Counterfeit tablets frequently contain fentanyl or nitazenes rather than genuine oxycodone.",
    ukStreetPrice: "£1–£2 per mg",
    wikiTitle: "Oxycodone",
    imageUrl: "/uploads/street-drugs/oxycodone.jpg?v=1a136fc1",
  },
  {
    slug: "tramadol",
    clinicalName: "Tramadol",
    streetNames: ["Trammies", "Chill Pills"],
    classification: "Opioid",
    durationOfEffects: "4–6 hours",
    risks:
      "Seizure risk even at moderate doses, serotonin syndrome (especially combined with antidepressants or MDMA), dependency, and danger when mixed with alcohol.",
    commonlyMixedWith:
      "Diverted tablets are usually genuine pharmaceutical product, but counterfeit versions vary in strength and purity.",
    ukStreetPrice: "£0.50–£2 per tablet",
    wikiTitle: "Tramadol",
    imageUrl: "/uploads/street-drugs/tramadol.jpg?v=019a19d4",
  },
  {
    slug: "zopiclone",
    clinicalName: "Zopiclone (\"Z-drug\")",
    streetNames: ["Zimms", "Zopi"],
    classification: "Depressant",
    durationOfEffects: "6–8 hours, with a lingering next-day \"hangover\" effect",
    risks:
      "Severe next-day drowsiness and impairment (driving risk), dependency with regular use, danger combined with alcohol or opioids, and memory blackouts.",
    commonlyMixedWith: "Illicit tablets can be counterfeit or inconsistent in dose, similar to street benzodiazepines.",
    ukStreetPrice: "£0.50–£2 per tablet",
    wikiTitle: "Zopiclone",
    imageUrl: "/uploads/street-drugs/zopiclone.jpg?v=ced83d9f",
  },
  {
    slug: "codeine",
    clinicalName: "Codeine (including misuse of cough/cold products)",
    streetNames: ["Lean", "Purple Drank", "Sizzurp"],
    classification: "Opioid",
    durationOfEffects: "4–6 hours",
    risks:
      "Respiratory depression at high doses, liver damage from paracetamol-combination products taken to excess, dependency, and danger combined with alcohol or sedatives.",
    commonlyMixedWith:
      "Usually combined with paracetamol in over-the-counter products; \"lean\"/purple drank misuse also mixes it with promethazine and soft drinks.",
    wikiTitle: "Codeine",
    imageUrl: "/uploads/street-drugs/codeine.jpg?v=c61e442e",
  },
  {
    slug: "gabapentinoids",
    clinicalName: "Pregabalin / Gabapentin (\"gabapentinoids\")",
    streetNames: ["Buds", "Pregs", "Nerve Pills"],
    classification: "Depressant",
    durationOfEffects: "4–7 hours",
    risks:
      "Increasingly linked to overdose deaths, especially combined with opioids; respiratory depression and dependency. Both are Class C controlled substances in the UK.",
    commonlyMixedWith:
      "Usually diverted genuine pharmaceutical product with consistent dosing, but increasingly co-used (not chemically cut) with opioids, which sharply raises overdose risk.",
    ukStreetPrice: "£0.50–£1.50 per tablet",
    wikiTitle: "Pregabalin",
    imageUrl: "/uploads/street-drugs/gabapentinoids.jpg?v=ee2db63e",
  },
  {
    slug: "anabolic-steroids",
    clinicalName: "Anabolic-androgenic steroids",
    streetNames: ["Roids", "Juice", "Gear"],
    classification: "Other",
    durationOfEffects: "Effects build over weeks of a use cycle rather than a single session",
    risks:
      "Cardiovascular strain, liver toxicity, hormonal disruption, increased aggression, and dependency.",
    commonlyMixedWith:
      "Underground/counterfeit products frequently contain incorrect dosing, a different compound than labelled, or contaminants from unsterile manufacturing.",
    ukStreetPrice: "Highly variable — often £30–£60 per cycle component",
    wikiTitle: "Anabolic steroid",
    imageUrl: "/uploads/street-drugs/anabolic-steroids.jpg?v=a340c2be",
  },
  {
    slug: "khat",
    clinicalName: "Khat (Catha edulis)",
    streetNames: ["Khat", "Qat", "Miraa"],
    classification: "Stimulant",
    durationOfEffects: "A few hours, typically chewed over an extended session",
    risks:
      "Insomnia, anxiety, dependency with heavy chewing, and oral health problems. Reclassified as a Class C drug in the UK in 2014.",
    commonlyMixedWith: "Not typically cut; the main contamination risk is pesticide residue from agricultural production.",
    wikiTitle: "Khat",
    imageUrl: "/uploads/street-drugs/khat.jpg?v=8557be8a",
  },
  {
    slug: "salvia",
    clinicalName: "Salvia divinorum",
    streetNames: ["Salvia", "Sally-D"],
    classification: "Hallucinogen",
    durationOfEffects: "5–20 minutes — short but very intense",
    risks:
      "Intense, disorienting effects with a real risk of injury from complete disconnection from surroundings; unpredictable psychological reactions.",
    commonlyMixedWith:
      "Not typically cut; sold as dried leaf, though potency (salvinorin A content) varies significantly between \"standard\" and \"enhanced\" preparations.",
    wikiTitle: "Salvia divinorum",
    imageUrl: "/uploads/street-drugs/salvia.jpg?v=efd2b490",
  },
];
