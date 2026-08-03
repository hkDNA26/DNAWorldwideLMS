// Ported from the Sales Drug Search Console (~/Documents/drug-panel-search/public/data.js),
// sourced from DNA Legal's "Where's Whally?" pricing spreadsheet. Static reference data —
// no need to regenerate unless the underlying panel/pricing spreadsheet changes.

export interface DrugGroup {
  label: string | null;
  drugs: string[];
}

export interface Panel {
  name: string;
  price: number;
  isPerDrug: boolean;
  header: string | null;
  groups: DrugGroup[];
  rawLower: string;
}

export interface SimplePanel {
  name: string;
  desc: string;
}

export interface Medication {
  group: string | null;
  ingredient: string | null;
  brand: string;
}

export interface QuestionSet {
  question: string;
  answer: string;
}

export const PANELS: Panel[] = [
  {
    "name": "5 Panel",
    "price": 129.0,
    "isPerDrug": false,
    "header": "5 panel - 21",
    "groups": [
      {
        "label": "Amphetamine",
        "drugs": [
          "Amphetamine"
        ]
      },
      {
        "label": "Cocaine Anhydroecgonine methylester",
        "drugs": [
          "Benzoylecgonine",
          "Cocaethylene",
          "Cocaine",
          "Norcocaine"
        ]
      },
      {
        "label": "Cannabinoids/Cannabis",
        "drugs": [
          "Cannabidiol (CBD)",
          "Cannabinol (CBN)",
          "Tetrahydrocannabinol",
          "THC-COOH"
        ]
      },
      {
        "label": "Methamphetamines",
        "drugs": [
          "MBDB",
          "MDA",
          "MDEA",
          "MDMA",
          "Methamphetamine"
        ]
      },
      {
        "label": "Opiates",
        "drugs": [
          "6-Monoacetylmorphine",
          "Codeine",
          "Dihydrocodeine",
          "Heroin",
          "Morphine",
          "Oxycodone"
        ]
      }
    ],
    "rawLower": "5 panel - 21\namphetamine, amphetamine\ncocaine anhydroecgonine methylester, benzoylecgonine, cocaethylene, cocaine, norcocaine\ncannabinoids/cannabis, cannabidiol (cbd), cannabinol (cbn), tetrahydrocannabinol, thc-cooh\nmethamphetamines, mbdb, mda, mdea, mdma, methamphetamine\nopiates, 6-monoacetylmorphine, codeine, dihydrocodeine, heroin, morphine, oxycodone"
  },
  {
    "name": "6 Panel",
    "price": 139.0,
    "isPerDrug": false,
    "header": "6 panel - 33",
    "groups": [
      {
        "label": "Amphetamine",
        "drugs": [
          "Amphetamine"
        ]
      },
      {
        "label": "Cocaine",
        "drugs": [
          "Anhydroecgonine methylester (AEME / Crack)",
          "Benzoylecgonine (BZE)",
          "Cocaethylene",
          "Cocaine",
          "Norcocaine"
        ]
      },
      {
        "label": "Benzodiazepines and sedatives - common",
        "drugs": [
          "7-amino-flunitrazepam",
          "Alprazolam",
          "Bromazepam",
          "Chlordiazepoxide",
          "Diazepam",
          "Flunitrazepam",
          "Haloperidol",
          "Lorazepam",
          "Midazolam",
          "Nitrazepam",
          "Nordiazepam",
          "Oxazepam",
          "Temazepam",
          "Zolpidem",
          "Zopiclone"
        ]
      },
      {
        "label": "Cannabinoids/Cannabis",
        "drugs": [
          "Cannabidiol (CBD)",
          "Cannabinol (CBN)",
          "Tetrahydrocannabinol",
          "THC-COOH"
        ]
      },
      {
        "label": "Methamphetamines",
        "drugs": [
          "MBDB",
          "MDA",
          "MDEA",
          "MDMA",
          "Methamphetamine"
        ]
      },
      {
        "label": "Opiates",
        "drugs": [
          "6-Monoacetylmorphine",
          "Codeine",
          "Dihydrocodeine",
          "Heroin",
          "Morphine",
          "Oxycodone"
        ]
      }
    ],
    "rawLower": "6 panel - 33\namphetamine (amphetamine)\ncocaine (anhydroecgonine methylester (aeme / crack), benzoylecgonine (bze), cocaethylene, cocaine, norcocaine)\nbenzodiazepines and sedatives - common (7-amino-flunitrazepam, alprazolam, bromazepam, chlordiazepoxide, diazepam, flunitrazepam, haloperidol, lorazepam, midazolam, nitrazepam, nordiazepam, oxazepam, temazepam, zolpidem, zopiclone)\ncannabinoids/cannabis (cannabidiol (cbd), cannabinol (cbn), tetrahydrocannabinol, thc-cooh)\nmethamphetamines (mbdb, mda, mdea, mdma, methamphetamine)\nopiates (6-monoacetylmorphine, codeine, dihydrocodeine, heroin, morphine, oxycodone)"
  },
  {
    "name": "Pre-proceedings 7",
    "price": 159.0,
    "isPerDrug": false,
    "header": null,
    "groups": [
      {
        "label": null,
        "drugs": [
          "Pre-proceedings 7 - FTPP"
        ]
      },
      {
        "label": "Amphetamine",
        "drugs": [
          "Amphetamine"
        ]
      },
      {
        "label": "Cocaine",
        "drugs": [
          "Anhydroecgonine methylester (AEME / Crack)",
          "Benzoylecgonine (BZE)",
          "Cocaethylene",
          "Cocaine",
          "Norcocaine"
        ]
      },
      {
        "label": "Ketamine",
        "drugs": [
          "Ketamine",
          "Norketamine"
        ]
      },
      {
        "label": "Cannabinoids/Cannabis",
        "drugs": [
          "Cannabidiol (CBD)",
          "Cannabinol (CBN)",
          "Tetrahydrocannabinol",
          "THC-COOH"
        ]
      },
      {
        "label": "Methamphetamines",
        "drugs": [
          "MBDB",
          "MDA",
          "MDEA",
          "MDMA",
          "Methamphetamine"
        ]
      },
      {
        "label": "Opiates",
        "drugs": [
          "6-Monoacetylmorphine",
          "Codeine",
          "Dihydrocodeine",
          "Heroin",
          "Morphine",
          "Oxycodone"
        ]
      },
      {
        "label": "Tramadol",
        "drugs": [
          "O-Desmethyltramadol",
          "N-Desmethyltramadol",
          "Tramadol"
        ]
      }
    ],
    "rawLower": "pre-proceedings 7 - ftpp\namphetamine (amphetamine)\ncocaine (anhydroecgonine methylester (aeme / crack), benzoylecgonine (bze), cocaethylene, cocaine, norcocaine)\nketamine (ketamine, norketamine)\ncannabinoids/cannabis (cannabidiol (cbd), cannabinol (cbn), tetrahydrocannabinol, thc-cooh)\nmethamphetamines (mbdb, mda, mdea, mdma, methamphetamine)\nopiates (6-monoacetylmorphine, codeine, dihydrocodeine, heroin, morphine, oxycodone)\ntramadol (o-desmethyltramadol, n-desmethyltramadol, tramadol)"
  },
  {
    "name": "8 Panel",
    "price": 189.0,
    "isPerDrug": false,
    "header": "8 panel - 36",
    "groups": [
      {
        "label": "Amphetamine",
        "drugs": [
          "Amphetamine"
        ]
      },
      {
        "label": "Cocaine",
        "drugs": [
          "Anhydroecgonine methylester (AEME / Crack)",
          "Benzoylecgonine (BZE)",
          "Cocaethylene",
          "Cocaine",
          "Norcocaine"
        ]
      },
      {
        "label": "Ketamine",
        "drugs": [
          "Ketamine",
          "Norketamine"
        ]
      },
      {
        "label": "Benzodiazepines and sedatives - common",
        "drugs": [
          "7-amino-flunitrazepam",
          "Alprazolam",
          "Bromazepam",
          "Chlordiazepoxide",
          "Diazepam",
          "Flunitrazepam",
          "Haloperidol",
          "Lorazepam",
          "Midazolam",
          "Nitrazepam",
          "Nordiazepam",
          "Oxazepam",
          "Temazepam",
          "Zolpidem",
          "Zopiclone"
        ]
      },
      {
        "label": "Cannabinoids/Cannabis",
        "drugs": [
          "Cannabidiol (CBD)",
          "Cannabinol (CBN)",
          "Tetrahydrocannabinol",
          "THC-COOH"
        ]
      },
      {
        "label": "Methamphetamines",
        "drugs": [
          "MBDB",
          "MDA",
          "MDEA",
          "MDMA",
          "Methamphetamine"
        ]
      },
      {
        "label": "Opiates",
        "drugs": [
          "6-Monoacetylmorphine",
          "Codeine",
          "Dihydrocodeine",
          "Heroin",
          "Morphine",
          "Oxycodone"
        ]
      },
      {
        "label": "Tramadol",
        "drugs": [
          "O-Desmethyltramadol",
          "N-Desmethyltramadol",
          "Tramadol"
        ]
      }
    ],
    "rawLower": "8 panel - 36\namphetamine (amphetamine)\ncocaine (anhydroecgonine methylester (aeme / crack), benzoylecgonine (bze), cocaethylene, cocaine, norcocaine)\nketamine (ketamine, norketamine)\nbenzodiazepines and sedatives - common (7-amino-flunitrazepam, alprazolam, bromazepam, chlordiazepoxide, diazepam, flunitrazepam, haloperidol, lorazepam, midazolam, nitrazepam, nordiazepam, oxazepam, temazepam, zolpidem, zopiclone)\ncannabinoids/cannabis (cannabidiol (cbd), cannabinol (cbn), tetrahydrocannabinol, thc-cooh)\nmethamphetamines (mbdb, mda, mdea, mdma, methamphetamine)\nopiates (6-monoacetylmorphine, codeine, dihydrocodeine, heroin, morphine, oxycodone)\ntramadol (o-desmethyltramadol, n-desmethyltramadol, tramadol)"
  },
  {
    "name": "Fast Track 9 Panel/AOM",
    "price": 199.0,
    "isPerDrug": false,
    "header": "FT 9 // AOM - 38",
    "groups": [
      {
        "label": "Amphetamine",
        "drugs": [
          "Amphetamine"
        ]
      },
      {
        "label": "Cocaine",
        "drugs": [
          "Anhydroecgonine methylester (AEME / Crack)",
          "Benzoylecgonine (BZE)",
          "Cocaethylene",
          "Cocaine",
          "Norcocaine"
        ]
      },
      {
        "label": "Ketamine",
        "drugs": [
          "Ketamine",
          "Norketamine"
        ]
      },
      {
        "label": "Methadone",
        "drugs": [
          "Methadone",
          "EDDP"
        ]
      },
      {
        "label": "Benzodiazepines and sedatives - common",
        "drugs": [
          "7-amino-flunitrazepam",
          "Alprazolam",
          "Bromazepam",
          "Chlordiazepoxide",
          "Diazepam",
          "Flunitrazepam",
          "Haloperidol",
          "Lorazepam",
          "Midazolam",
          "Nitrazepam",
          "Nordiazepam",
          "Oxazepam",
          "Temazepam",
          "Zolpidem",
          "Zopiclone"
        ]
      },
      {
        "label": "Cannabinoids/Cannabis",
        "drugs": [
          "Cannabidiol (CBD)",
          "Cannabinol (CBN)",
          "Tetrahydrocannabinol",
          "THC-COOH"
        ]
      },
      {
        "label": "Methamphetamines",
        "drugs": [
          "MBDB",
          "MDA",
          "MDEA",
          "MDMA",
          "Methamphetamine"
        ]
      },
      {
        "label": "Opiates",
        "drugs": [
          "6-Monoacetylmorphine",
          "Codeine",
          "Dihydrocodeine",
          "Heroin",
          "Morphine",
          "Oxycodone"
        ]
      },
      {
        "label": "Tramadol",
        "drugs": [
          "O-Desmethyltramadol",
          "N-Desmethyltramadol",
          "Tramadol"
        ]
      }
    ],
    "rawLower": "ft 9 // aom - 38\namphetamine (amphetamine)\ncocaine (anhydroecgonine methylester (aeme / crack), benzoylecgonine (bze), cocaethylene, cocaine, norcocaine)\nketamine (ketamine, norketamine)\nmethadone (methadone, eddp)\nbenzodiazepines and sedatives - common (7-amino-flunitrazepam, alprazolam, bromazepam, chlordiazepoxide, diazepam, flunitrazepam, haloperidol, lorazepam, midazolam, nitrazepam, nordiazepam, oxazepam, temazepam, zolpidem, zopiclone)\ncannabinoids/cannabis (cannabidiol (cbd), cannabinol (cbn), tetrahydrocannabinol, thc-cooh)\nmethamphetamines (mbdb, mda, mdea, mdma, methamphetamine)\nopiates (6-monoacetylmorphine, codeine, dihydrocodeine, heroin, morphine, oxycodone)\ntramadol (o-desmethyltramadol, n-desmethyltramadol, tramadol)"
  },
  {
    "name": "Sensitive 9 Panel/AOM",
    "price": 199.0,
    "isPerDrug": false,
    "header": null,
    "groups": [
      {
        "label": "S+ 9 // AOM - 38",
        "drugs": [
          "DP"
        ]
      },
      {
        "label": "Amphetamine",
        "drugs": [
          "Amphetamine"
        ]
      },
      {
        "label": "Cocaine",
        "drugs": [
          "Anhydroecgonine methylester (AEME / Crack)",
          "Benzoylecgonine (BZE)",
          "Cocaethylene",
          "Cocaine",
          "Norcocaine"
        ]
      },
      {
        "label": "Ketamine",
        "drugs": [
          "Ketamine",
          "Norketamine"
        ]
      },
      {
        "label": "Methadone",
        "drugs": [
          "Methadone",
          "EDDP"
        ]
      },
      {
        "label": "Benzodiazepines and sedatives - common",
        "drugs": [
          "7-amino-flunitrazepam",
          "Alprazolam",
          "Bromazepam",
          "Chlordiazepoxide",
          "Diazepam",
          "Flunitrazepam",
          "Haloperidol",
          "Lorazepam",
          "Midazolam",
          "Nitrazepam",
          "Nordiazepam",
          "Oxazepam",
          "Temazepam",
          "Zolpidem",
          "Zopiclone"
        ]
      },
      {
        "label": "Cannabinoids/Cannabis",
        "drugs": [
          "Cannabidiol (CBD)",
          "Cannabinol (CBN)",
          "Tetrahydrocannabinol",
          "THC-COOH"
        ]
      },
      {
        "label": "Cathinones",
        "drugs": [
          "Mephedrone"
        ]
      },
      {
        "label": "Methamphetamines",
        "drugs": [
          "MBDB",
          "MDA",
          "MDEA",
          "MDMA",
          "Methamphetamine"
        ]
      },
      {
        "label": "Opiates",
        "drugs": [
          "6-Monoacetylmorphine",
          "Codeine",
          "Dihydrocodeine",
          "Heroin",
          "Morphine",
          "Oxycodone"
        ]
      }
    ],
    "rawLower": "s+ 9 // aom - 38 (dp)\namphetamine (amphetamine)\ncocaine (anhydroecgonine methylester (aeme / crack), benzoylecgonine (bze), cocaethylene, cocaine, norcocaine)\nketamine (ketamine, norketamine)\nmethadone (methadone, eddp)\nbenzodiazepines and sedatives - common (7-amino-flunitrazepam, alprazolam, bromazepam, chlordiazepoxide, diazepam, flunitrazepam, haloperidol, lorazepam, midazolam, nitrazepam, nordiazepam, oxazepam, temazepam, zolpidem, zopiclone)\ncannabinoids/cannabis (cannabidiol (cbd), cannabinol (cbn), tetrahydrocannabinol, thc-cooh)\ncathinones (mephedrone)\nmethamphetamines (mbdb, mda, mdea, mdma, methamphetamine)\nopiates (6-monoacetylmorphine, codeine, dihydrocodeine, heroin, morphine, oxycodone)"
  },
  {
    "name": "Level 2",
    "price": 239.0,
    "isPerDrug": false,
    "header": "Level 2 - 59",
    "groups": [
      {
        "label": "Amphetamine",
        "drugs": [
          "Amphetamine"
        ]
      },
      {
        "label": "Cocaine",
        "drugs": [
          "Anhydroecgonine methylester (AEME / Crack)",
          "Benzoylecgonine (BZE)",
          "Cocaethylene",
          "Cocaine",
          "Norcocaine"
        ]
      },
      {
        "label": "Ketamine",
        "drugs": [
          "Ketamine",
          "Norketamine"
        ]
      },
      {
        "label": "Methadone",
        "drugs": [
          "Methadone",
          "EDDP"
        ]
      },
      {
        "label": "Drugs by LC-MS/MS level 2 pharma -",
        "drugs": [
          "Clozapine",
          "Fluoxetine",
          "Trazodone"
        ]
      },
      {
        "label": "Narcotics by LC-MS/MS level 2 -",
        "drugs": [
          "Buprenorphine",
          "Fentanyl",
          "Norbuprenorphine",
          "Norpethidine",
          "Norpropoxyphene",
          "Pethidine",
          "Propoxyphene"
        ]
      },
      {
        "label": "Drugs by LC-MS/MS level 2 -",
        "drugs": [
          "Mescaline",
          "Phencyclidine"
        ]
      },
      {
        "label": "Benzodiazepines and sedatives level 2 -",
        "drugs": [
          "7-amino-flunitrazepam",
          "Alprazolam",
          "Bromazepam",
          "Chlordiazepoxide",
          "Diazepam",
          "Flunitrazepam",
          "Haloperidol",
          "Lorazepam",
          "Midazolam",
          "Nitrazepam",
          "Nordiazepam",
          "Oxazepam",
          "Temazepam",
          "Zolpidem",
          "Zopiclone"
        ]
      },
      {
        "label": "Cannabinoids/Cannabis",
        "drugs": [
          "Cannabidiol (CBD)",
          "Cannabinol (CBN)",
          "Tetrahydrocannabinol",
          "THC-COOH"
        ]
      },
      {
        "label": "Cathinones level 2 -",
        "drugs": [
          "Cathinone",
          "Mephedrone",
          "Methcathinone"
        ]
      },
      {
        "label": "Methamphetamines",
        "drugs": [
          "MBDB",
          "MDA",
          "MDEA",
          "MDMA",
          "Methamphetamine"
        ]
      },
      {
        "label": "Opiates",
        "drugs": [
          "6-Monoacetylmorphine",
          "Codeine",
          "Dihydrocodeine",
          "Heroin",
          "Morphine",
          "Oxycodone"
        ]
      },
      {
        "label": "LSD",
        "drugs": [
          "LSD"
        ]
      },
      {
        "label": "Tramadol",
        "drugs": [
          "O-Desmethyltramadol",
          "N-Desmethyltramadol",
          "Tramadol"
        ]
      }
    ],
    "rawLower": "level 2 - 59\namphetamine (amphetamine)\ncocaine (anhydroecgonine methylester (aeme / crack), benzoylecgonine (bze), cocaethylene, cocaine, norcocaine)\nketamine (ketamine, norketamine)\nmethadone (methadone, eddp)\ndrugs by lc-ms/ms level 2 pharma - (clozapine, fluoxetine, trazodone)\nnarcotics by lc-ms/ms level 2 - (buprenorphine, fentanyl, norbuprenorphine, norpethidine, norpropoxyphene, pethidine, propoxyphene)\ndrugs by lc-ms/ms level 2 - (mescaline, phencyclidine)\nbenzodiazepines and sedatives level 2 - (7-amino-flunitrazepam, alprazolam, bromazepam, chlordiazepoxide, diazepam, flunitrazepam, haloperidol, lorazepam, midazolam, nitrazepam, nordiazepam, oxazepam, temazepam, zolpidem, zopiclone)\ncannabinoids/cannabis (cannabidiol (cbd), cannabinol (cbn), tetrahydrocannabinol, thc-cooh)\ncathinones level 2 - (cathinone, mephedrone, methcathinone)\nmethamphetamines (mbdb, mda, mdea, mdma, methamphetamine)\nopiates (6-monoacetylmorphine, codeine, dihydrocodeine, heroin, morphine, oxycodone)\nlsd (lsd)\ntramadol (o-desmethyltramadol, n-desmethyltramadol, tramadol)"
  },
  {
    "name": "Level 3",
    "price": 400.0,
    "isPerDrug": false,
    "header": "Level 3 - 112",
    "groups": [
      {
        "label": "Amphetamine",
        "drugs": [
          "Amphetamine"
        ]
      },
      {
        "label": "Cocaine",
        "drugs": [
          "Anhydroecgonine methylester (AEME / Crack)",
          "Benzoylecgonine (BZE)",
          "Cocaethylene",
          "Cocaine",
          "Norcocaine"
        ]
      },
      {
        "label": "Ketamine",
        "drugs": [
          "Ketamine",
          "Norketamine"
        ]
      },
      {
        "label": "Methadone",
        "drugs": [
          "Methadone",
          "EDDP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Drugs by LC-MS/MS level 3 - (Alfentanil, Amisulpride, Amitriptyline, Aripiprazole, Benperidol, Carbamazepine, Chlorpromazine, Chlorprothixene"
        ]
      },
      {
        "label": "Clomipramine",
        "drugs": [
          "Clonazepam",
          "Clonidine",
          "Clotiapine",
          "Clozapine",
          "Desipramine",
          "Dextromethorphan",
          "Dosulepin",
          "Doxepin",
          "Etomidate",
          "Fluoxetine",
          "Flupenthixol",
          "Fluphenazine",
          "Flupirtine",
          "Flurazepam",
          "Fluvoxamine",
          "Gabapentin",
          "Imipramine",
          "Levetiracetam",
          "Maprotiline",
          "Medazepam",
          "Melperone",
          "Mianserin",
          "Mirtazapine",
          "Moclobemide",
          "Modafinil",
          "Norclobazam",
          "Nortilidine",
          "Nortriptyline",
          "Noscapine",
          "Opipramol",
          "Paroxetine",
          "Pentazocine",
          "Pipamperone",
          "Pregabaline",
          "Reboxetine",
          "Risperidone",
          "Sertraline",
          "Sulpiride",
          "Thioridazine",
          "Tilidine",
          "Trazodone",
          "Trimipramine",
          "Venlafaxine",
          "Viloxazine",
          "Zaleplon",
          "Ziprasidone",
          "Zotepine",
          "Zuclopenthixol)\""
        ]
      },
      {
        "label": "Narcotics by LC-MS/MS level 3 -",
        "drugs": [
          "Buprenorphine",
          "Fentanyl",
          "Norbuprenorphine",
          "Norpethidine",
          "Norpropoxyphene",
          "Pethidine",
          "Propoxyphene"
        ]
      },
      {
        "label": "Drugs by LC-MS/MS level 3 -",
        "drugs": [
          "Ecgoninemethylester",
          "Hydrocodone",
          "Hydromorphone",
          "Mescaline",
          "Oxymorphone",
          "Phencyclidine"
        ]
      },
      {
        "label": "Benzodiazepines and sedatives level 3 -",
        "drugs": [
          "7-amino-flunitrazepam",
          "Alprazolam",
          "Bromazepam",
          "Chlordiazepoxide",
          "Citalopram",
          "Clobazam",
          "Diazepam",
          "Diphenhydramine",
          "Flunitrazepam",
          "Haloperidol",
          "Levomepromazine",
          "Lorazepam",
          "Lormetazepam",
          "Midazolam",
          "Nitrazepam",
          "Nordiazepam",
          "Oxazepam",
          "Promazine",
          "Promethazine",
          "Temazepam",
          "Tetrazepam",
          "Triazolam",
          "Zolpidem",
          "Zopiclone"
        ]
      },
      {
        "label": "Cannabinoids/Cannabis",
        "drugs": [
          "Cannabidiol (CBD)",
          "Cannabinol (CBN)",
          "Tetrahydrocannabinol",
          "THC-COOH"
        ]
      },
      {
        "label": "Cathinones level 3 -",
        "drugs": [
          "Cathinone",
          "MDPV",
          "Mephedrone",
          "Methcathinone"
        ]
      },
      {
        "label": "Methamphetamines",
        "drugs": [
          "MBDB",
          "MDA",
          "MDEA",
          "MDMA",
          "Methamphetamine"
        ]
      },
      {
        "label": "Opiates",
        "drugs": [
          "6-Monoacetylmorphine",
          "Codeine",
          "Dihydrocodeine",
          "Heroin",
          "Morphine",
          "Oxycodone"
        ]
      },
      {
        "label": "LSD",
        "drugs": [
          "LSD"
        ]
      },
      {
        "label": "Tramadol",
        "drugs": [
          "O-Desmethyltramadol",
          "N-Desmethyltramadol",
          "Tramadol"
        ]
      }
    ],
    "rawLower": "level 3 - 112\namphetamine (amphetamine)\ncocaine (anhydroecgonine methylester (aeme / crack), benzoylecgonine (bze), cocaethylene, cocaine, norcocaine)\nketamine (ketamine, norketamine)\nmethadone (methadone, eddp)\ndrugs by lc-ms/ms level 3 - (alfentanil, amisulpride, amitriptyline, aripiprazole, benperidol, carbamazepine, chlorpromazine, chlorprothixene\nclomipramine, clonazepam, clonidine, clotiapine, clozapine, desipramine, dextromethorphan, dosulepin, doxepin, etomidate, fluoxetine, flupenthixol, fluphenazine, flupirtine, flurazepam, fluvoxamine, gabapentin, imipramine, levetiracetam, maprotiline, medazepam, melperone, mianserin, mirtazapine, moclobemide, modafinil, norclobazam, nortilidine, nortriptyline, noscapine, opipramol, paroxetine, pentazocine, pipamperone, pregabaline, reboxetine, risperidone, sertraline, sulpiride, thioridazine, tilidine, trazodone, trimipramine, venlafaxine, viloxazine, zaleplon, ziprasidone, zotepine, zuclopenthixol)\"\nnarcotics by lc-ms/ms level 3 - (buprenorphine, fentanyl, norbuprenorphine, norpethidine, norpropoxyphene, pethidine, propoxyphene)\ndrugs by lc-ms/ms level 3 - (ecgoninemethylester, hydrocodone, hydromorphone, mescaline, oxymorphone, phencyclidine)\nbenzodiazepines and sedatives level 3 - (7-amino-flunitrazepam, alprazolam, bromazepam, chlordiazepoxide, citalopram, clobazam, diazepam, diphenhydramine, flunitrazepam, haloperidol, levomepromazine, lorazepam, lormetazepam, midazolam, nitrazepam, nordiazepam, oxazepam, promazine, promethazine, temazepam, tetrazepam, triazolam, zolpidem, zopiclone)\ncannabinoids/cannabis (cannabidiol (cbd), cannabinol (cbn), tetrahydrocannabinol, thc-cooh)\ncathinones level 3 - (cathinone, mdpv, mephedrone, methcathinone)\nmethamphetamines (mbdb, mda, mdea, mdma, methamphetamine)\nopiates (6-monoacetylmorphine, codeine, dihydrocodeine, heroin, morphine, oxycodone)\nlsd (lsd)\ntramadol (o-desmethyltramadol, n-desmethyltramadol, tramadol)"
  },
  {
    "name": "Full Medical Screen - WP",
    "price": 295.0,
    "isPerDrug": false,
    "header": null,
    "groups": [
      {
        "label": null,
        "drugs": [
          "Full Medical Screen - WP"
        ]
      },
      {
        "label": "Amphetamine",
        "drugs": [
          "Amphetamine"
        ]
      },
      {
        "label": "Cocaine",
        "drugs": [
          "Anhydroecgonine methylester (AEME / Crack)",
          "Benzoylecgonine (BZE)",
          "Cocaethylene",
          "Cocaine",
          "Norcocaine"
        ]
      },
      {
        "label": "Ketamine",
        "drugs": [
          "Ketamine",
          "Norketamine"
        ]
      },
      {
        "label": "Methadone",
        "drugs": [
          "Methadone",
          "EDDP"
        ]
      },
      {
        "label": "Drugs by LC-MS/MS",
        "drugs": [
          "Acetylcodeine",
          "Acetylfentanyl",
          "Alfentanil",
          "Clonazepam",
          "Clozapine",
          "Fluoxetine",
          "Methaqualone",
          "Remifentanyl",
          "Sertraline",
          "Trazodone"
        ]
      },
      {
        "label": "Narcotics by LC-MS/MS",
        "drugs": [
          "Buprenorphine",
          "Fentanyl",
          "Norbuprenorphine",
          "Norpropoxyphene",
          "Pethidine",
          "Propoxyphene"
        ]
      },
      {
        "label": "DOA by LC-MS/MS",
        "drugs": [
          "Cathine",
          "Mescaline",
          "Phencyclidine"
        ]
      },
      {
        "label": "Benzodiazepines and sedatives WP",
        "drugs": [
          "7-amino-clonazepam",
          "7-amino-flunitrazepam",
          "Alprazolam",
          "Bromazepam",
          "Chlordiazepoxide",
          "Diazepam",
          "Flunitrazepam",
          "Haloperidol",
          "Lorazepam",
          "Midazolam",
          "Nitrazepam",
          "Nordiazepam",
          "Oxazepam",
          "Temazepam",
          "Zolpidem",
          "Zopiclone"
        ]
      },
      {
        "label": "Cannabinoids/Cannabis",
        "drugs": [
          "Cannabidiol (CBD)",
          "Cannabinol (CBN)",
          "Tetrahydrocannabinol",
          "THC-COOH"
        ]
      },
      {
        "label": "Cathinones level 3 -",
        "drugs": [
          "Cathinone",
          "MDPV",
          "Mephedrone",
          "Methcathinone"
        ]
      },
      {
        "label": "Methamphetamines",
        "drugs": [
          "MBDB",
          "MDA",
          "MDEA",
          "MDMA",
          "Methamphetamine"
        ]
      },
      {
        "label": "Opiates",
        "drugs": [
          "6-Monoacetylmorphine",
          "Codeine",
          "Dihydrocodeine",
          "Heroin",
          "Morphine",
          "Oxycodone"
        ]
      },
      {
        "label": "LSD",
        "drugs": [
          "LSD"
        ]
      },
      {
        "label": "Tramadol",
        "drugs": [
          "O-Desmethyltramadol",
          "N-Desmethyltramadol",
          "Tramadol"
        ]
      }
    ],
    "rawLower": "full medical screen - wp\namphetamine (amphetamine)\ncocaine (anhydroecgonine methylester (aeme / crack), benzoylecgonine (bze), cocaethylene, cocaine, norcocaine)\nketamine (ketamine, norketamine)\nmethadone (methadone, eddp)\ndrugs by lc-ms/ms (acetylcodeine, acetylfentanyl, alfentanil, clonazepam, clozapine, fluoxetine, methaqualone, remifentanyl, sertraline, trazodone)\nnarcotics by lc-ms/ms (buprenorphine, fentanyl, norbuprenorphine, norpropoxyphene, pethidine, propoxyphene)\ndoa by lc-ms/ms (cathine, mescaline, phencyclidine)\nbenzodiazepines and sedatives wp (7-amino-clonazepam, 7-amino-flunitrazepam, alprazolam, bromazepam, chlordiazepoxide, diazepam, flunitrazepam, haloperidol, lorazepam, midazolam, nitrazepam, nordiazepam, oxazepam, temazepam, zolpidem, zopiclone)\ncannabinoids/cannabis (cannabidiol (cbd), cannabinol (cbn), tetrahydrocannabinol, thc-cooh)\ncathinones level 3 - (cathinone, mdpv, mephedrone, methcathinone)\nmethamphetamines (mbdb, mda, mdea, mdma, methamphetamine)\nopiates (6-monoacetylmorphine, codeine, dihydrocodeine, heroin, morphine, oxycodone)\nlsd (lsd)\ntramadol (o-desmethyltramadol, n-desmethyltramadol, tramadol)"
  },
  {
    "name": "Detailed Steroid screen 19 Hair",
    "price": 600.0,
    "isPerDrug": false,
    "header": null,
    "groups": [
      {
        "label": null,
        "drugs": [
          "Detailed steroid screen"
        ]
      },
      {
        "label": "Anabolic steroids GC",
        "drugs": [
          "Boldenone",
          "DHEA",
          "Mesterolone",
          "Metandienone",
          "Metenolone",
          "Nandrolone",
          "Norandrostenedione",
          "Testosterone"
        ]
      },
      {
        "label": "Anabolic steroids LC",
        "drugs": [
          "Stanozolol",
          "Trenbolone"
        ]
      },
      {
        "label": "Anabolic steroids GC-MS-MS",
        "drugs": [
          "Nandrolone decanoate",
          "Nandrolone phenylpropionate",
          "Testosterone acetate",
          "Testosterone benzoate",
          "Testosterone cypionate",
          "Testosterone decanoate",
          "Testosterone enanthate",
          "Testosterone phenylpropionate",
          "Testosterone propionate"
        ]
      }
    ],
    "rawLower": "detailed steroid screen\nanabolic steroids gc (boldenone, dhea, mesterolone, metandienone, metenolone, nandrolone, norandrostenedione, testosterone)\nanabolic steroids lc (stanozolol, trenbolone)\nanabolic steroids gc-ms-ms (nandrolone decanoate, nandrolone phenylpropionate, testosterone acetate, testosterone benzoate, testosterone cypionate, testosterone decanoate, testosterone enanthate, testosterone phenylpropionate, testosterone propionate)"
  },
  {
    "name": "Detailed Steroid screen 19 BH/Nails",
    "price": 600.0,
    "isPerDrug": false,
    "header": null,
    "groups": [
      {
        "label": "BH/Nail Steroids",
        "drugs": [
          "Boldenone",
          "DHEA",
          "Mesterolone",
          "Metandienone",
          "Metenolone",
          "Nandrolone",
          "Nandrolone decanoate",
          "Nandrolone phenylpropionate",
          "Norandrostenedione",
          "Stanozolol",
          "Testosterone",
          "Testosterone acetate",
          "Testosterone benzoate",
          "Testosterone cypionate",
          "Testosterone decanoate",
          "Testosterone enanthate",
          "Testosterone phenylpropionate",
          "Testosterone propionate",
          "Trenbolone"
        ]
      }
    ],
    "rawLower": "bh/nail steroids (boldenone, dhea, mesterolone, metandienone, metenolone, nandrolone, nandrolone decanoate, nandrolone phenylpropionate, norandrostenedione, stanozolol, testosterone, testosterone acetate, testosterone benzoate, testosterone cypionate, testosterone decanoate, testosterone enanthate, testosterone phenylpropionate, testosterone propionate, trenbolone)"
  },
  {
    "name": "Core Class A+B",
    "price": 289.0,
    "isPerDrug": false,
    "header": null,
    "groups": [
      {
        "label": null,
        "drugs": [
          "Core Class A+B"
        ]
      },
      {
        "label": "Amphetamine",
        "drugs": [
          "Amphetamine"
        ]
      },
      {
        "label": "Cocaine",
        "drugs": [
          "Anhydroecgonine methylester (AEME / Crack)",
          "Benzoylecgonine (BZE)",
          "Cocaethylene",
          "Cocaine",
          "Norcocaine"
        ]
      },
      {
        "label": "Ketamine",
        "drugs": [
          "Ketamine",
          "Norketamine"
        ]
      },
      {
        "label": "Methadone",
        "drugs": [
          "Methadone",
          "EDDP"
        ]
      },
      {
        "label": "Cannabinoids/Cannabis",
        "drugs": [
          "Cannabidiol (CBD)",
          "Cannabinol (CBN)",
          "Tetrahydrocannabinol",
          "THC-COOH"
        ]
      },
      {
        "label": "Cathinones",
        "drugs": [
          "Mephedrone"
        ]
      },
      {
        "label": "Methamphetamines",
        "drugs": [
          "MBDB",
          "MDA",
          "MDEA",
          "MDMA",
          "Methamphetamine"
        ]
      },
      {
        "label": "Opiates",
        "drugs": [
          "6-Monoacetylmorphine",
          "Codeine",
          "Dihydrocodeine",
          "Heroin",
          "Morphine",
          "Oxycodone"
        ]
      },
      {
        "label": "LSD",
        "drugs": [
          "LSD"
        ]
      }
    ],
    "rawLower": "core class a+b\namphetamine (amphetamine)\ncocaine (anhydroecgonine methylester (aeme / crack), benzoylecgonine (bze), cocaethylene, cocaine, norcocaine)\nketamine (ketamine, norketamine)\nmethadone (methadone, eddp)\ncannabinoids/cannabis (cannabidiol (cbd), cannabinol (cbn), tetrahydrocannabinol, thc-cooh)\ncathinones (mephedrone)\nmethamphetamines (mbdb, mda, mdea, mdma, methamphetamine)\nopiates (6-monoacetylmorphine, codeine, dihydrocodeine, heroin, morphine, oxycodone)\nlsd (lsd)"
  },
  {
    "name": "Anti-Depressant Detailed",
    "price": 170.0,
    "isPerDrug": false,
    "header": null,
    "groups": [
      {
        "label": "Anti-Depressant Detailed",
        "drugs": [
          "7-amino-flunitrazepam",
          "7-Amino-clonazepam",
          "Alprazolam",
          "Bromazepam",
          "Chlordiazepoxide",
          "Chlorpheniramine",
          "Citalopram",
          "Clobazam",
          "Cyamemazine",
          "Diazepam",
          "Diphenhydramine",
          "Doxylamin",
          "Flunitrazepam",
          "Fluoxetine",
          "Haloperidol",
          "Hydroxyzine",
          "Levomepromazine",
          "Loprazolam",
          "Lorazepam",
          "Lormetazaepam",
          "Midazolam",
          "Nitrazepam",
          "Nordiazepam",
          "Oxazepam",
          "Paroxetine",
          "Promazine",
          "Promethazine",
          "Scopolamine",
          "Sertraline",
          "Temazepam",
          "Tetrazepam",
          "Trazadone",
          "Triazolam",
          "Zolpidem",
          "Zopliclone"
        ]
      }
    ],
    "rawLower": "anti-depressant detailed (7-amino-flunitrazepam, 7-amino-clonazepam, alprazolam, bromazepam, chlordiazepoxide, chlorpheniramine, citalopram, clobazam, cyamemazine, diazepam, diphenhydramine, doxylamin, flunitrazepam, fluoxetine, haloperidol, hydroxyzine, levomepromazine, loprazolam, lorazepam, lormetazaepam, midazolam, nitrazepam, nordiazepam, oxazepam, paroxetine, promazine, promethazine, scopolamine, sertraline, temazepam, tetrazepam, trazadone, triazolam, zolpidem, zopliclone)"
  },
  {
    "name": "Pharmaceuticals",
    "price": 295.0,
    "isPerDrug": false,
    "header": null,
    "groups": [
      {
        "label": "Pharmaceuticals",
        "drugs": [
          "7-Amino-clonazepam",
          "Alfentanil",
          "Aripiprazole",
          "Amisulpride",
          "Amitriptyline",
          "Benperidol",
          "Benzodiazepines",
          "Carbamazepine",
          "Citalopram",
          "Clomipramine",
          "Clonazepam",
          "Clonidine",
          "Chlorpheniramine",
          "Chlorpromazine",
          "Chlorprothixene",
          "Clotiapine",
          "Clozapine",
          "Cyamemazine",
          "Desipreamine",
          "Dextromethorphan",
          "Dosulepin",
          "Doxepin",
          "Doxylamine",
          "Etomidate",
          "Fluoxetine",
          "Flupenthixol",
          "Fluphenazine",
          "Flupirtine",
          "Flurazepam",
          "Fluvoxamine",
          "Gabapentin",
          "Hydroxyzine",
          "Imipramine",
          "Levetiracetam",
          "Loprazolam",
          "Maprotiline",
          "Medazepam",
          "Melperone",
          "Mianserin",
          "Mirtazapine",
          "Moclobemide",
          "Modalfinil",
          "Norclobazam",
          "Nortilidine",
          "Nortriptyline",
          "Noscapine",
          "Opipramol",
          "Paroxetine",
          "Pentazocine",
          "Pipamperone",
          "Pregabalin",
          "Reboxetine",
          "Risperidone",
          "Scopolamine",
          "Sertraline",
          "Sulpiride",
          "Tilidine",
          "Trazodone",
          "Thioridazine",
          "Trimipramine",
          "Venlafaxine",
          "Viloxazine",
          "Zalepon",
          "Ziprasidone",
          "Zotepine"
        ]
      }
    ],
    "rawLower": "pharmaceuticals (7-amino-clonazepam, alfentanil, aripiprazole, amisulpride, amitriptyline, benperidol, benzodiazepines, carbamazepine, citalopram, clomipramine, clonazepam, clonidine, chlorpheniramine, chlorpromazine, chlorprothixene, clotiapine, clozapine, cyamemazine, desipreamine, dextromethorphan, dosulepin, doxepin, doxylamine, etomidate, fluoxetine, flupenthixol, fluphenazine, flupirtine, flurazepam, fluvoxamine, gabapentin, hydroxyzine, imipramine, levetiracetam, loprazolam, maprotiline, medazepam, melperone, mianserin, mirtazapine, moclobemide, modalfinil, norclobazam, nortilidine, nortriptyline, noscapine, opipramol, paroxetine, pentazocine, pipamperone, pregabalin, reboxetine, risperidone, scopolamine, sertraline, sulpiride, tilidine, trazodone, thioridazine, trimipramine, venlafaxine, viloxazine, zalepon, ziprasidone, zotepine)"
  },
  {
    "name": "Basic Metals Panel 4",
    "price": 349.0,
    "isPerDrug": false,
    "header": null,
    "groups": [
      {
        "label": "Basic Metals Panel 4",
        "drugs": [
          "Arsenic",
          "Cadmium",
          "Led",
          "Mercury"
        ]
      }
    ],
    "rawLower": "basic metals panel 4 (arsenic, cadmium, led, mercury) "
  },
  {
    "name": "Detailed Metals Panel 32",
    "price": 799.0,
    "isPerDrug": false,
    "header": null,
    "groups": [
      {
        "label": "Detailed Metals Panel 32",
        "drugs": [
          "Aluminium",
          "Antimony",
          "Arsenic",
          "Barium",
          "Beryllium",
          "Bismuth",
          "Bore",
          "Cadmium",
          "Chrome",
          "Cobalt",
          "Copper",
          "Gallium",
          "Germanium",
          "Lead",
          "Lithium",
          "Manganese",
          "Mercury",
          "Molybdenum",
          "Nickel",
          "Palladium",
          "Platinum",
          "Rubidium",
          "Selenium",
          "Silver",
          "Strontium",
          "Tellurium",
          "Thallium",
          "Tin",
          "Tungsten",
          "Uranium",
          "Vanadium",
          "Zinc"
        ]
      }
    ],
    "rawLower": "detailed metals panel 32 (aluminium, antimony, arsenic, barium, beryllium, bismuth, bore, cadmium, chrome, cobalt, copper, gallium, germanium, lead, lithium, manganese, mercury, molybdenum, nickel, palladium, platinum, rubidium, selenium, silver, strontium, tellurium, thallium, tin, tungsten, uranium, vanadium, zinc)"
  },
  {
    "name": "Specific drug testing (Normal)",
    "price": 38.0,
    "isPerDrug": true,
    "header": "Specific Drug Testing",
    "groups": [
      {
        "label": "Amphetamine",
        "drugs": [
          "Amphetamine"
        ]
      },
      {
        "label": "Cocaine",
        "drugs": [
          "Anhydroecgonine methylester (AEME / Crack)",
          "Benzoylecgonine (BZE)",
          "Cocaethylene",
          "Cocaine",
          "Norcocaine"
        ]
      },
      {
        "label": "Ketamine",
        "drugs": [
          "Ketamine",
          "Norketamine"
        ]
      },
      {
        "label": "Methadone",
        "drugs": [
          "Methadone",
          "EDDP"
        ]
      },
      {
        "label": "Benzodiazepines and sedatives - common",
        "drugs": [
          "7-amino-flunitrazepam",
          "Alprazolam",
          "Bromazepam",
          "Chlordiazepoxide",
          "Diazepam",
          "Flunitrazepam",
          "Haloperidol",
          "Lorazepam",
          "Midazolam",
          "Nitrazepam",
          "Nordiazepam",
          "Oxazepam",
          "Temazepam",
          "Zolpidem",
          "Zopiclone"
        ]
      },
      {
        "label": "Cannabinoids/Cannabis",
        "drugs": [
          "Cannabidiol (CBD)",
          "Cannabinol (CBN)",
          "Tetrahydrocannabinol",
          "THC-COOH"
        ]
      },
      {
        "label": "Methamphetamines",
        "drugs": [
          "MBDB",
          "MDA",
          "MDEA",
          "MDMA",
          "Methamphetamine"
        ]
      },
      {
        "label": "Opiates",
        "drugs": [
          "6-Monoacetylmorphine",
          "Codeine",
          "Dihydrocodeine",
          "Heroin",
          "Morphine",
          "Oxycodone"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Tramadol (O-Desmethyltramadol, N-Desmethyltramadol, Tramadol)\""
        ]
      }
    ],
    "rawLower": "specific drug testing \namphetamine (amphetamine)\ncocaine (anhydroecgonine methylester (aeme / crack), benzoylecgonine (bze), cocaethylene, cocaine, norcocaine)\nketamine (ketamine, norketamine)\nmethadone (methadone, eddp)\nbenzodiazepines and sedatives - common (7-amino-flunitrazepam, alprazolam, bromazepam, chlordiazepoxide, diazepam, flunitrazepam, haloperidol, lorazepam, midazolam, nitrazepam, nordiazepam, oxazepam, temazepam, zolpidem, zopiclone)\ncannabinoids/cannabis (cannabidiol (cbd), cannabinol (cbn), tetrahydrocannabinol, thc-cooh)\nmethamphetamines (mbdb, mda, mdea, mdma, methamphetamine)\nopiates (6-monoacetylmorphine, codeine, dihydrocodeine, heroin, morphine, oxycodone)\ntramadol (o-desmethyltramadol, n-desmethyltramadol, tramadol)\""
  },
  {
    "name": "Specific drug testing (Z Drugs)",
    "price": 149.0,
    "isPerDrug": true,
    "header": "Z Drugs",
    "groups": [
      {
        "label": null,
        "drugs": [
          "Methyl-PBP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "1M-3PP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-AI"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-Amino-1-phenyl-butan 2-BA"
        ]
      },
      {
        "label": "2-Brom-4",
        "drugs": [
          "2-CA"
        ]
      },
      {
        "label": "2-Chlor-4",
        "drugs": [
          "2-EEC",
          "2-EMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-Ethylamino-1-phenylbutan"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-FA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-FEC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-FIC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-FMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-FMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-IA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-MAPB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-MEC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-MeOMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-Methoxyketamin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-Methyl-PPP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-Methylamino-1-phenylbutan"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-oxo-3-hydroxy-LSD"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2-Thiothinon"
        ]
      },
      {
        "label": "2",
        "drugs": [
          "3-DCPP"
        ]
      },
      {
        "label": "2",
        "drugs": [
          "3-DMEC"
        ]
      },
      {
        "label": "2",
        "drugs": [
          "3-DMMC"
        ]
      },
      {
        "label": "2",
        "drugs": [
          "3-MDA"
        ]
      },
      {
        "label": "2",
        "drugs": [
          "3-MDMA"
        ]
      },
      {
        "label": "2",
        "drugs": [
          "3-MDMC"
        ]
      },
      {
        "label": "2",
        "drugs": [
          "3-MDPV"
        ]
      },
      {
        "label": "2",
        "drugs": [
          "4-DMEC"
        ]
      },
      {
        "label": "2",
        "drugs": [
          "5-DMA"
        ]
      },
      {
        "label": "2",
        "drugs": [
          "5-DMMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "212-2"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25B-NBF"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25B-NBOMe"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25C-NBF"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25C-NBOH"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25C-NBOMe"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25D-NBOMe"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25E-NBOMe"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25G-NBOMe"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25H-NBOMe"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25I-NBF"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25I-NBMD"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25I-NBOH"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25I-NBOMe"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25N-NBOMe"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25T2-NBOMe"
        ]
      },
      {
        "label": null,
        "drugs": [
          "25T7-NBOMe"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-B"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-B-BZP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-B-fly"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-C"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-D"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-E"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-F"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-G"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-H"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-I"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-N"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-O"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-P"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-T"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-T-2"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-T-4"
        ]
      },
      {
        "label": null,
        "drugs": [
          "2C-T-7"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-BA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-BMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-CA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-CAF"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-EEC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-EMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-FA 4-MA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-FEA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-FEC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-FIC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-FMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-FMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-FPM"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-IA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-MA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-MEC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-MeOMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-Methoxy-PCP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-Methyl-PBP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-Methylbuphedron"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-Methylfentanyl"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3-Methylthiofentanyl"
        ]
      },
      {
        "label": "3",
        "drugs": [
          "4-Dichloro-methylphenidate"
        ]
      },
      {
        "label": "3",
        "drugs": [
          "4-Dimethoxy-\u03b1-PVP"
        ]
      },
      {
        "label": "3",
        "drugs": [
          "4-DMA"
        ]
      },
      {
        "label": "3",
        "drugs": [
          "4-DMEC"
        ]
      },
      {
        "label": "3",
        "drugs": [
          "4-DMMC"
        ]
      },
      {
        "label": "3",
        "drugs": [
          "4-EDMA"
        ]
      },
      {
        "label": "3",
        "drugs": [
          "4-EDMC"
        ]
      },
      {
        "label": "3",
        "drugs": [
          "4-MDPA"
        ]
      },
      {
        "label": "3",
        "drugs": [
          "4-MDPHP"
        ]
      },
      {
        "label": "3",
        "drugs": [
          "4-MDPPP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3\u2018-Fluor-\u03b1-PPP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "30C-NBOMe"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3C-B-fly"
        ]
      },
      {
        "label": null,
        "drugs": [
          "3C-P"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-AcO-DALT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Fluor-5-methoxy-DMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-APB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-APDB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-BA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-BMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Brom-2"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-CA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-CAB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Chlor-2"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Chlor-methamphetamine"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-EAPB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-EEC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-EMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-ETA"
        ]
      },
      {
        "label": "4-Ethyl-N",
        "drugs": [
          "N-DMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Ethylamphetamine"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-FA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-FBP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-FEC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-FIC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Fluor-PBP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Fluor-PV8"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Fluor-PV9"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Fluor-\u03b1-PVP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Fluorpentedron"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Fluortropacocain"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-FMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-FMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-HA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-IA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-MAPB"
        ]
      },
      {
        "label": "4-MBC",
        "drugs": [
          "Benzedron"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Me-\u03b1-ET"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-MEC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-MeO-\u03b1-PVP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-MeOPBP"
        ]
      },
      {
        "label": "4-Methoxy-N",
        "drugs": [
          "N-DMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Methoxy-PV9"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Methyl-AMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Methyl-methylphenidate"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Methyl-N-methylbuphedron"
        ]
      },
      {
        "label": "4-Methyl-N",
        "drugs": [
          "N-DMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Methyl-PBP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Methyl-\u03b1-ethyl-aminobutiophenon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Methyl-\u03b1-ethyl-aminopentiophenon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Methylaminorex"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Methylbuphedron"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-Methylpentedron"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-MMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-MTA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-OH-DET"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-OH-DiPT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-OH-DMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-OH-MET"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4-OH-MiPT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-Brom-DMT"
        ]
      },
      {
        "label": "4",
        "drugs": [
          "4\u2018-Dimethyl-aminorex"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4\u2018-Chlor-\u03b1-PPP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4\u2018-Fluor-\u03b1-PPP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4\u2018-Methyl-PPP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "4\u2018-Methylhexedron"
        ]
      },
      {
        "label": null,
        "drugs": [
          "461 WIN-55"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-APDB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-APDI"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-API"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-Chlor-AMT 5"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-DBFPV"
        ]
      },
      {
        "label": "5-DMA",
        "drugs": [
          "DOC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-DMMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-EAPB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-Fluor-AMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-Fluor-DMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-IAI"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-MAPB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-MAPDB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-MDMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-MeO-AMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-MeO-DALT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-MeO-DiPT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-MeO-DMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-MeO-MiPT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-MeO-\u03b1-ET"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-Methoxymethylon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5-OH-DMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5CI-AB-PINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5CI-NNEI"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5F-AB PINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5F-ADB-PINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5F-ADBICA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5F-AKB-48"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5F-AMB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "5F-APICA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "6-EAPB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "6-Fluor-AMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "6-Fluor-DMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "6-MAPB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "6-MAPDB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "7-APDB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "7-Dichloro-Tryptamin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "7-Fluortryptamin DALT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "7-Me-\u03b1-ET"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AB FUBINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AB FUBINACA 2- fluorobenzyl isomer"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AB-001"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AB-005"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AB-CHMINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AB-PINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "ACEA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Acetyl-alpha-methylfentanyl"
        ]
      },
      {
        "label": null,
        "drugs": [
          "ACPA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "ADB-FUBINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "ADB-PINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "ADBICA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AKB-48"
        ]
      },
      {
        "label": null,
        "drugs": [
          "ALICB-122"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Allobarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Alpha-Methylfentanyl"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Alpha-Methylthiofentanyl"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Alphenal"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AM 694"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AM-1220"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AM-1248"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AM-2201 benzimidazol analog"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AM-2201-2- hydroxyindol"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AM-2232"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AM-2233"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AMB-PICA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AMMI"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Amobarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Aniracetam"
        ]
      },
      {
        "label": null,
        "drugs": [
          "APICA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Aprobarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Barbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Barbituric acid"
        ]
      },
      {
        "label": null,
        "drugs": [
          "BB-22"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Benzphetamin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "beta-hydroxy-3-methylfentanyl"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Beta-hydroxyfentanyl"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Betaxolol"
        ]
      },
      {
        "label": null,
        "drugs": [
          "BHBA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "bk-2C-B Bromo-DragonFLY"
        ]
      },
      {
        "label": null,
        "drugs": [
          "bk-MDDMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "BMDP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Buphedron (MABP)*"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Butabarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Butalbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Butallylonal"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Butethal"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Carfentanil"
        ]
      },
      {
        "label": null,
        "drugs": [
          "CC-2201"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Chlorphentermin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Clotermin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "CMP"
        ]
      },
      {
        "label": "CP 47 497-",
        "drugs": [
          "C8"
        ]
      },
      {
        "label": null,
        "drugs": [
          "CP 55 244"
        ]
      },
      {
        "label": null,
        "drugs": [
          "CP 55 940"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Cumyl-5FPICA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Cumyl-BICA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Cumyl-PICA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Cumyl-PINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Cumyl-THPICA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Cyclobarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Cyclopal"
        ]
      },
      {
        "label": null,
        "drugs": [
          "D2PM"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DBZP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Deschloro-N-ethyl-ketamin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Desoxy-D2PM"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DET"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Dibutylon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Diclofensin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Diethylcathinon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Dimethocain"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Dimethylcathinon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DiPT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DL-4662"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DMMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DOB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DOET"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DOI"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DOM"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DOT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DPT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "EAM-2201"
        ]
      },
      {
        "label": null,
        "drugs": [
          "EG-018"
        ]
      },
      {
        "label": null,
        "drugs": [
          "EMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "EPEA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Etaqualon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Ethcathinon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Ethylon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Ethylphenidate"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Etomidate"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Eutylon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "FAB-144"
        ]
      },
      {
        "label": null,
        "drugs": [
          "FDU-PB-22"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Fencamfamin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Fentanyl N-oxide"
        ]
      },
      {
        "label": null,
        "drugs": [
          "FLEA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Flupirtine"
        ]
      },
      {
        "label": null,
        "drugs": [
          "FUB-144"
        ]
      },
      {
        "label": null,
        "drugs": [
          "FUB-AKB48"
        ]
      },
      {
        "label": null,
        "drugs": [
          "FUB-AMB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "FUB-JWH 018"
        ]
      },
      {
        "label": null,
        "drugs": [
          "FUB-NPB-22"
        ]
      },
      {
        "label": null,
        "drugs": [
          "HDMP-28"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Heptabarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Hexedron"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Hexethal"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Hexobarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "HMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "I-AMB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Isopentedro"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Isopropylphenidate"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-018 N-(5-bromopentyl) analog"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-022"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-030"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-080"
        ]
      },
      {
        "label": null,
        "drugs": [
          "WH-122 N-(4-pentenyl) analog"
        ]
      },
      {
        "label": "JWH-122 N-",
        "drugs": [
          "5-iodopentyl"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-180"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-182"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-200 analog1"
        ]
      },
      {
        "label": "JWH-210 \u2013",
        "drugs": [
          "CI"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-213"
        ]
      },
      {
        "label": "JWH-250-ME-",
        "drugs": [
          "CI"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-251"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-307"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-368"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-370"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-387"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-398"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-412"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Lisdexamfetamine"
        ]
      },
      {
        "label": null,
        "drugs": [
          "M-1438"
        ]
      },
      {
        "label": null,
        "drugs": [
          "M-144"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MA-CHMINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MAB-CHMINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MAFP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MAM-2201"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MAM-2201 N-(5-chloropentyl) analog"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Mazindol"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MBZP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MCHB-1"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MDAI"
        ]
      },
      {
        "label": "MDDMA",
        "drugs": [
          "Dimethylone"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MDMB-CHMICA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MDMB-CHMINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MDMB-FUBINACA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MDP2P"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MDPBP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MDPH"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Mebroqualon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Mefenorex"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MEM"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Mephentermin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Mephobarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Mepiprazol"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MEPIRAPIM"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Mescaline"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MET"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Methabarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Methylbenzodioxolylbutanamine"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Methylmethaqualon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Methylphenobarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MiPT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MMAI"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MMB-018"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MMB-2201"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MMDA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MN-18"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MN-24"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MN-25-2-methyl derivatives"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MO-CHMINAC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MPM"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MTTA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "N-DMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "N-Ethyl-N-methylcathinon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "N-Ethylketamin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "N-Ethylnorpentedron"
        ]
      },
      {
        "label": null,
        "drugs": [
          "N-Ethylpentylon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "N-Formyl-methamphetamin"
        ]
      },
      {
        "label": "N-Hydroxy-amphetamin*",
        "drugs": [
          "NOHA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "N-Hydroxy-MDA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "N-Methyl-2-AI"
        ]
      },
      {
        "label": null,
        "drugs": [
          "N-Methylnantradol"
        ]
      },
      {
        "label": "N",
        "drugs": [
          "N-Dimethyl-MDA"
        ]
      },
      {
        "label": "N",
        "drugs": [
          "N-Dimethylpentylon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Nabilone"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Nabitan"
        ]
      },
      {
        "label": null,
        "drugs": [
          "NAM"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Nantradol"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Naphyron"
        ]
      },
      {
        "label": null,
        "drugs": [
          "NEB"
        ]
      },
      {
        "label": null,
        "drugs": [
          "NESS-0327"
        ]
      },
      {
        "label": null,
        "drugs": [
          "NET"
        ]
      },
      {
        "label": null,
        "drugs": [
          "NIDA-41020"
        ]
      },
      {
        "label": null,
        "drugs": [
          "NM2201"
        ]
      },
      {
        "label": null,
        "drugs": [
          "NMT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "NNEI"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Normephedron"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Norpethidine"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Nortilidine"
        ]
      },
      {
        "label": null,
        "drugs": [
          "NPA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "NPB-22"
        ]
      },
      {
        "label": null,
        "drugs": [
          "NRG-3"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Olanzapine"
        ]
      },
      {
        "label": null,
        "drugs": [
          "O-4310"
        ]
      },
      {
        "label": null,
        "drugs": [
          "OMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "OMMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "p-Fluorofentanyl"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PB-22"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PCE"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PCPr"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Penthedron"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Pentobarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Pentorex"
        ]
      },
      {
        "label": null,
        "drugs": [
          "pFPP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Phenmetrazin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Phenobarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Phentermin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Phenylmethylbarbituric acid"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Phenylpiperazin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Phenylpiracetam"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Pipradol"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Piritramid"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PMMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PPMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PPP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Probarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Propallylonal"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Propofol"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Propylhexedrin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Psilocybin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PTI-1"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PTI-2"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PV10"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PV4"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PV9"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PX 1"
        ]
      },
      {
        "label": null,
        "drugs": [
          "PX 2"
        ]
      },
      {
        "label": null,
        "drugs": [
          "R-MMC"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Ractopamide"
        ]
      },
      {
        "label": "RCS-4",
        "drugs": [
          "C1"
        ]
      },
      {
        "label": "RCS-4",
        "drugs": [
          "C10"
        ]
      },
      {
        "label": "RCS-4",
        "drugs": [
          "C2"
        ]
      },
      {
        "label": "RCS-4",
        "drugs": [
          "C3-allyl"
        ]
      },
      {
        "label": "RCS-4",
        "drugs": [
          "C3"
        ]
      },
      {
        "label": "RCS-4",
        "drugs": [
          "C4"
        ]
      },
      {
        "label": "RCS-4",
        "drugs": [
          "C5-cyclopropyl"
        ]
      },
      {
        "label": "RCS-4",
        "drugs": [
          "C5"
        ]
      },
      {
        "label": "RCS-4",
        "drugs": [
          "C6"
        ]
      },
      {
        "label": "RCS-4",
        "drugs": [
          "C7"
        ]
      },
      {
        "label": "RCS-4",
        "drugs": [
          "C8-phenethyl"
        ]
      },
      {
        "label": "RCS-4",
        "drugs": [
          "C8"
        ]
      },
      {
        "label": null,
        "drugs": [
          "RCS-8"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Rimonabant"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Rolicyclidin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "SDB-005"
        ]
      },
      {
        "label": null,
        "drugs": [
          "SDB-006"
        ]
      },
      {
        "label": null,
        "drugs": [
          "SDB-006 N-phenylanalog"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Secobarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Selegilin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "SER-601"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Sibutramin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Sigmodal"
        ]
      },
      {
        "label": null,
        "drugs": [
          "SLV-319"
        ]
      },
      {
        "label": null,
        "drugs": [
          "SLV-326"
        ]
      },
      {
        "label": null,
        "drugs": [
          "SR-144528"
        ]
      },
      {
        "label": null,
        "drugs": [
          "SR-147778"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Stanozolol"
        ]
      },
      {
        "label": null,
        "drugs": [
          "STS-135"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Talbutal"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Tenocyclidin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "THCCOOH"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Thialbarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Thiamylal"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Thiobarbituric acid"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Thiofentanyl"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Thiopental"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Thiopropamin"
        ]
      },
      {
        "label": null,
        "drugs": [
          "THJ"
        ]
      },
      {
        "label": null,
        "drugs": [
          "THJ-018"
        ]
      },
      {
        "label": null,
        "drugs": [
          "THJ-2201"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Tilidine"
        ]
      },
      {
        "label": null,
        "drugs": [
          "TMA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "TMA-2"
        ]
      },
      {
        "label": null,
        "drugs": [
          "TMA-6"
        ]
      },
      {
        "label": null,
        "drugs": [
          "UR-12"
        ]
      },
      {
        "label": "UR-12 UR-144 UR-144-",
        "drugs": [
          "5-bromopentyl"
        ]
      },
      {
        "label": null,
        "drugs": [
          "UR-144"
        ]
      },
      {
        "label": "UR-144-",
        "drugs": [
          "5-chloropentyl"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Vinbarbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Vinylbital"
        ]
      },
      {
        "label": null,
        "drugs": [
          "WIN-53365"
        ]
      },
      {
        "label": null,
        "drugs": [
          "WIN-54"
        ]
      },
      {
        "label": null,
        "drugs": [
          "XLR-11"
        ]
      },
      {
        "label": null,
        "drugs": [
          "XLR-12"
        ]
      },
      {
        "label": null,
        "drugs": [
          "\u03b1-Dimethylamino-pentiophenon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "\u03b1-ET"
        ]
      },
      {
        "label": null,
        "drugs": [
          "\u03b1-Ethylamino-pentiophenon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "\u03b1-Methylamino-hexanophenon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "\u03b1-PAPP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "\u03b1-PBP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "\u03b1-PBT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "\u03b1-PHP"
        ]
      },
      {
        "label": "\u03b1-PHPP",
        "drugs": [
          "PV8"
        ]
      },
      {
        "label": null,
        "drugs": [
          "\u03b1-PipBP"
        ]
      },
      {
        "label": null,
        "drugs": [
          "\u03b1-Propylamino-pentiophenon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "\u03b1-PVT"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Cyclizine Hydrochloride"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-007"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-015"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-018"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-019"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-020"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-073"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-081"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-122"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-200"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-203"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-210"
        ]
      },
      {
        "label": null,
        "drugs": [
          "JWH-250"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AM-2201"
        ]
      },
      {
        "label": null,
        "drugs": [
          "CP 47 497"
        ]
      },
      {
        "label": null,
        "drugs": [
          "HU 210"
        ]
      },
      {
        "label": null,
        "drugs": [
          "WIN 55 21-2-2"
        ]
      },
      {
        "label": null,
        "drugs": [
          "DHEA"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Synthetic cannabinoids"
        ]
      },
      {
        "label": null,
        "drugs": [
          "NPS"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Acetone"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Acebutolol"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Atenolol"
        ]
      },
      {
        "label": null,
        "drugs": [
          "enanthate"
        ]
      },
      {
        "label": null,
        "drugs": [
          "epitestosterone"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Epitestosterone"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Isopropyl Fentanyl"
        ]
      },
      {
        "label": null,
        "drugs": [
          "MDPV"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Alfentanil"
        ]
      },
      {
        "label": null,
        "drugs": [
          "AM-624"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Butylon"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Methadone"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Zolpidem"
        ]
      },
      {
        "label": null,
        "drugs": [
          "Zopiclone"
        ]
      }
    ],
    "rawLower": "z drugs \nmethyl-pbp\n1m-3pp\n2-ai\n2-amino-1-phenyl-butan 2-ba\n2-brom-4, 2-ca\n2-chlor-4, 2-eec, 2-emc\n2-ethylamino-1-phenylbutan\n2-fa\n2-fec\n2-fic\n2-fma\n2-fmc\n2-ia\n2-mapb\n2-mec\n2-meomc\n2-methoxyketamin\n2-methyl-ppp\n2-methylamino-1-phenylbutan\n2-oxo-3-hydroxy-lsd\n2-thiothinon\n2,3-dcpp\n2,3-dmec\n2,3-dmmc\n2,3-mda\n2,3-mdma\n2,3-mdmc\n2,3-mdpv\n2,4-dmec\n2,5-dma\n2,5-dmma\n212-2\n25b-nbf\n25b-nbome\n25c-nbf\n25c-nboh\n25c-nbome\n25d-nbome\n25e-nbome\n25g-nbome\n25h-nbome\n25i-nbf\n25i-nbmd\n25i-nboh\n25i-nbome\n25n-nbome\n25t2-nbome\n25t7-nbome\n2c-b\n2c-b-bzp\n2c-b-fly\n2c-c\n2c-d\n2c-e\n2c-f\n2c-g\n2c-h\n2c-i\n2c-n\n2c-o\n2c-p\n2c-t\n2c-t-2\n2c-t-4\n2c-t-7\n3-ba\n3-bmc\n3-ca\n3-caf\n3-eec\n3-emc\n3-fa 4-ma\n3-fea\n3-fec\n3-fic\n3-fma\n3-fmc\n3-fpm\n3-ia\n3-ma\n3-mec\n3-meomc\n3-methoxy-pcp\n3-methyl-pbp\n3-methylbuphedron\n3-methylfentanyl\n3-methylthiofentanyl\n3,4-dichloro-methylphenidate\n3,4-dimethoxy-\u03b1-pvp\n3,4-dma\n3,4-dmec\n3,4-dmmc\n3,4-edma\n3,4-edmc\n3,4-mdpa\n3,4-mdphp\n3,4-mdppp\n3\u2018-fluor-\u03b1-ppp\n30c-nbome\n3c-b-fly\n3c-p\n4-aco-dalt \n4-fluor-5-methoxy-dmt\n4-apb\n4-apdb\n4-ba\n4-bmc\n4-brom-2\n4-ca\n4-cab\n4-chlor-2\n4-chlor-methamphetamine\n4-eapb\n4-eec\n4-emc\n4-eta\n4-ethyl-n,n-dmc\n4-ethylamphetamine\n4-fa\n4-fbp\n4-fec\n4-fic\n4-fluor-pbp\n4-fluor-pv8\n4-fluor-pv9\n4-fluor-\u03b1-pvp\n4-fluorpentedron\n4-fluortropacocain\n4-fma\n4-fmc\n4-ha\n4-ia\n4-mapb\n4-mbc (benzedron)\n4-me-\u03b1-et\n4-mec\n4-meo-\u03b1-pvp\n4-meopbp\n4-methoxy-n,n-dmc\n4-methoxy-pv9\n4-methyl-amt\n4-methyl-methylphenidate\n4-methyl-n-methylbuphedron\n4-methyl-n,n-dmc\n4-methyl-pbp\n4-methyl-\u03b1-ethyl-aminobutiophenon\n4-methyl-\u03b1-ethyl-aminopentiophenon\n4-methylaminorex\n4-methylbuphedron\n4-methylpentedron\n4-mma\n4-mta\n4-oh-det\n4-oh-dipt\n4-oh-dmt\n4-oh-met\n4-oh-mipt\n5-brom-dmt\n4,4\u2018-dimethyl-aminorex\n4\u2018-chlor-\u03b1-ppp\n4\u2018-fluor-\u03b1-ppp\n4\u2018-methyl-ppp\n4\u2018-methylhexedron\n461 win-55\n5-apdb\n5-apdi\n5-api\n5-chlor-amt 5\n5-dbfpv\n5-dma (doc)\n5-dmma\n5-eapb\n5-fluor-amt\n5-fluor-dmt\n5-iai\n5-mapb\n5-mapdb\n5-mdma\n5-meo-amt\n5-meo-dalt\n5-meo-dipt\n5-meo-dmt\n5-meo-mipt\n5-meo-\u03b1-et\n5-methoxymethylon\n5-oh-dmt\n5ci-ab-pinaca\n5ci-nnei\n5f-ab pinaca\n5f-adb-pinaca\n5f-adbica\n5f-akb-48\n5f-amb\n5f-apica\n6-eapb\n6-fluor-amt\n6-fluor-dmt\n6-mapb\n6-mapdb\n7-apdb\n7-dichloro-tryptamin\n7-fluortryptamin dalt\n7-me-\u03b1-et\nab fubinaca\nab fubinaca 2- fluorobenzyl isomer\nab-001\nab-005\nab-chminaca\nab-pinaca\nacea\nacetyl-alpha-methylfentanyl\nacpa\nadb-fubinaca\nadb-pinaca\nadbica\nakb-48\nalicb-122\nallobarbital\nalpha-methylfentanyl\nalpha-methylthiofentanyl\nalphenal\nam 694\nam-1220\nam-1248\nam-2201 benzimidazol analog\nam-2201-2- hydroxyindol\nam-2232\nam-2233\namb-pica\nammi\namobarbital\namt\naniracetam\napica\naprobarbital\nbarbital\nbarbituric acid\nbb-22\nbenzphetamin\nbeta-hydroxy-3-methylfentanyl\nbeta-hydroxyfentanyl\nbetaxolol\nbhba\nbk-2c-b bromo-dragonfly\nbk-mddma\nbmdp\nbuphedron (mabp)*\nbutabarbital\nbutalbital\nbutallylonal\nbutethal\ncarfentanil\ncc-2201\nchlorphentermin\nclotermin\ncmp\ncp 47 497-(c8)\ncp 55 244\ncp 55 940\ncumyl-5fpica\ncumyl-bica\ncumyl-pica\ncumyl-pinaca\ncumyl-thpica\ncyclobarbital\ncyclopal\nd2pm\ndbzp\ndeschloro-n-ethyl-ketamin\ndesoxy-d2pm\ndet\ndibutylon\ndiclofensin\ndiethylcathinon\ndimethocain\ndimethylcathinon\ndipt\ndl-4662\ndmma\ndmt\ndob\ndoet\ndoi\ndom\ndot\ndpt\neam-2201\neg-018\nema\nepea\netaqualon\nethcathinon\nethylon\nethylphenidate\netomidate\neutylon\nfab-144\nfdu-pb-22\nfencamfamin\nfentanyl n-oxide\nflea\nflupirtine\nfub-144\nfub-akb48\nfub-amb\nfub-jwh 018\nfub-npb-22\nhdmp-28\nheptabarbital\nhexedron\nhexethal\nhexobarbital\nhma\ni-amb\nisopentedro\nisopropylphenidate\njwh-018 n-(5-bromopentyl) analog\njwh-022\njwh-030\njwh-080\nwh-122 n-(4-pentenyl) analog\njwh-122 n-(5-iodopentyl)\njwh-180\njwh-182\njwh-200 analog1\njwh-210 \u2013(ci)\njwh-213\njwh-250-me-(ci)\njwh-251\njwh-307\njwh-368\njwh-370\njwh-387\njwh-398\njwh-412\nlisdexamfetamine\nm-1438\nm-144\nma-chminaca\nmab-chminaca\nmafp\nmam-2201\nmam-2201 n-(5-chloropentyl) analog\nmazindol\nmbzp\nmchb-1\nmdai\nmddma (dimethylone)\nmdmb-chmica\nmdmb-chminaca\nmdmb-fubinaca\nmdp2p\nmdpbp\nmdph\nmebroqualon\nmefenorex\nmem\nmephentermin\nmephobarbital\nmepiprazol\nmepirapim\nmescaline\nmet\nmethabarbital\nmethylbenzodioxolylbutanamine\nmethylmethaqualon\nmethylphenobarbital\nmipt\nmmai\nmmb-018\nmmb-2201\nmmda\nmn-18\nmn-24\nmn-25-2-methyl derivatives\nmo-chminac\nmpm\nmtta\nn-dma\nn-ethyl-n-methylcathinon\nn-ethylketamin\nn-ethylnorpentedron\nn-ethylpentylon\nn-formyl-methamphetamin\nn-hydroxy-amphetamin* (noha)\nn-hydroxy-mda\nn-methyl-2-ai\nn-methylnantradol\nn,n-dimethyl-mda\nn,n-dimethylpentylon\nnabilone\nnabitan\nnam\nnantradol\nnaphyron\nneb\nness-0327\nnet\nnida-41020\nnm2201\nnmt\nnnei\nnormephedron\nnorpethidine\nnortilidine\nnpa\nnpb-22\nnrg-3\nolanzapine\no-4310\noma\nomma\np-fluorofentanyl\npb-22\npce\npcpr\npenthedron\npentobarbital\npentorex\npfpp\nphenmetrazin\nphenobarbital\nphentermin\nphenylmethylbarbituric acid\nphenylpiperazin\nphenylpiracetam\npipradol\npiritramid\npma\npmma\nppma\nppp\nprobarbital\npropallylonal\npropofol\npropylhexedrin\npsilocybin\npti-1\npti-2\npv10\npv4\npv9\npx 1\npx 2\nr-mmc\nractopamide\nrcs-4 (c1)\nrcs-4 (c10)\nrcs-4 (c2)\nrcs-4 (c3-allyl)\nrcs-4 (c3)\nrcs-4 (c4)\nrcs-4 (c5-cyclopropyl)\nrcs-4 (c5)\nrcs-4 (c6)\nrcs-4 (c7)\nrcs-4 (c8-phenethyl)\nrcs-4 (c8)\nrcs-8\nrimonabant\nrolicyclidin\nsdb-005\nsdb-006\nsdb-006 n-phenylanalog\nsecobarbital\nselegilin\nser-601\nsibutramin\nsigmodal\nslv-319\nslv-326\nsr-144528\nsr-147778\nstanozolol\nsts-135\ntalbutal\ntenocyclidin\nthccooh\nthialbarbital\nthiamylal\nthiobarbituric acid\nthiofentanyl\nthiopental\nthiopropamin\nthj\nthj-018\nthj-2201\ntilidine\ntma\ntma-2\ntma-6\nur-12\nur-12 ur-144 ur-144-(5-bromopentyl)\nur-144\nur-144-(5-chloropentyl)\nvinbarbital\nvinylbital\nwin-53365\nwin-54\nxlr-11\nxlr-12\n\u03b1-dimethylamino-pentiophenon\n\u03b1-et\n\u03b1-ethylamino-pentiophenon\n\u03b1-methylamino-hexanophenon\n\u03b1-papp\n\u03b1-pbp\n\u03b1-pbt\n\u03b1-php\n\u03b1-phpp (pv8)\n\u03b1-pipbp\n\u03b1-propylamino-pentiophenon\n\u03b1-pvt\ncyclizine hydrochloride\njwh-007\njwh-015\njwh-018\njwh-019\njwh-020\njwh-073\njwh-081\njwh-122\njwh-200\njwh-203\njwh-210\njwh-250\nam-2201\ncp 47 497\nhu 210\nwin 55 21-2-2\ndhea\nsynthetic cannabinoids\nnps\nacetone\nacebutolol\natenolol\nenanthate\nepitestosterone\nepitestosterone\nisopropyl fentanyl\nmdpv\nalfentanil\nam-624\nbutylon\nmethadone\nzolpidem\nzopiclone\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"
  }
];

export const DRUG_LIST: string[] = [
  "1M-3PP",
  "2-AI",
  "2-Amino-1-phenyl-butan 2-BA",
  "2-CA",
  "2-EEC",
  "2-EMC",
  "2-Ethylamino-1-phenylbutan",
  "2-FA",
  "2-FEC",
  "2-FIC",
  "2-FMA",
  "2-FMC",
  "2-IA",
  "2-MAPB",
  "2-MEC",
  "2-MeOMC",
  "2-Methoxyketamin",
  "2-Methyl-PPP",
  "2-Methylamino-1-phenylbutan",
  "2-oxo-3-hydroxy-LSD",
  "2-Thiothinon",
  "212-2",
  "25B-NBF",
  "25B-NBOMe",
  "25C-NBF",
  "25C-NBOH",
  "25C-NBOMe",
  "25D-NBOMe",
  "25E-NBOMe",
  "25G-NBOMe",
  "25H-NBOMe",
  "25I-NBF",
  "25I-NBMD",
  "25I-NBOH",
  "25I-NBOMe",
  "25N-NBOMe",
  "25T2-NBOMe",
  "25T7-NBOMe",
  "2C-B",
  "2C-B-BZP",
  "2C-B-fly",
  "2C-C",
  "2C-D",
  "2C-E",
  "2C-F",
  "2C-G",
  "2C-H",
  "2C-I",
  "2C-N",
  "2C-O",
  "2C-P",
  "2C-T",
  "2C-T-2",
  "2C-T-4",
  "2C-T-7",
  "3-BA",
  "3-BMC",
  "3-CA",
  "3-CAF",
  "3-DCPP",
  "3-DMEC",
  "3-DMMC",
  "3-EEC",
  "3-EMC",
  "3-FA 4-MA",
  "3-FEA",
  "3-FEC",
  "3-FIC",
  "3-FMA",
  "3-FMC",
  "3-FPM",
  "3-IA",
  "3-MA",
  "3-MDA",
  "3-MDMA",
  "3-MDMC",
  "3-MDPV",
  "3-MEC",
  "3-MeOMC",
  "3-Methoxy-PCP",
  "3-Methyl-PBP",
  "3-Methylbuphedron",
  "3-Methylfentanyl",
  "3-Methylthiofentanyl",
  "30C-NBOMe",
  "3C-B-fly",
  "3C-P",
  "3\u2018-Fluor-\u03b1-PPP",
  "4-AcO-DALT",
  "4-APB",
  "4-APDB",
  "4-BA",
  "4-BMC",
  "4-Brom-2",
  "4-CA",
  "4-CAB",
  "4-Chlor-2",
  "4-Chlor-methamphetamine",
  "4-Dichloro-methylphenidate",
  "4-Dimethoxy-\u03b1-PVP",
  "4-DMA",
  "4-DMEC",
  "4-DMMC",
  "4-EAPB",
  "4-EDMA",
  "4-EDMC",
  "4-EEC",
  "4-EMC",
  "4-ETA",
  "4-Ethylamphetamine",
  "4-FA",
  "4-FBP",
  "4-FEC",
  "4-FIC",
  "4-Fluor-5-methoxy-DMT",
  "4-Fluor-PBP",
  "4-Fluor-PV8",
  "4-Fluor-PV9",
  "4-Fluor-\u03b1-PVP",
  "4-Fluorpentedron",
  "4-Fluortropacocain",
  "4-FMA",
  "4-FMC",
  "4-HA",
  "4-IA",
  "4-MAPB",
  "4-MDPA",
  "4-MDPHP",
  "4-MDPPP",
  "4-Me-\u03b1-ET",
  "4-MEC",
  "4-MeO-\u03b1-PVP",
  "4-MeOPBP",
  "4-Methoxy-PV9",
  "4-Methyl-AMT",
  "4-Methyl-methylphenidate",
  "4-Methyl-N-methylbuphedron",
  "4-Methyl-PBP",
  "4-Methyl-\u03b1-ethyl-aminobutiophenon",
  "4-Methyl-\u03b1-ethyl-aminopentiophenon",
  "4-Methylaminorex",
  "4-Methylbuphedron",
  "4-Methylpentedron",
  "4-MMA",
  "4-MTA",
  "4-OH-DET",
  "4-OH-DiPT",
  "4-OH-DMT",
  "4-OH-MET",
  "4-OH-MiPT",
  "461 WIN-55",
  "4\u2018-Chlor-\u03b1-PPP",
  "4\u2018-Dimethyl-aminorex",
  "4\u2018-Fluor-\u03b1-PPP",
  "4\u2018-Methyl-PPP",
  "4\u2018-Methylhexedron",
  "5-APDB",
  "5-APDI",
  "5-API",
  "5-Brom-DMT",
  "5-bromopentyl",
  "5-Chlor-AMT 5",
  "5-chloropentyl",
  "5-DBFPV",
  "5-DMA",
  "5-DMMA",
  "5-EAPB",
  "5-Fluor-AMT",
  "5-Fluor-DMT",
  "5-IAI",
  "5-iodopentyl",
  "5-MAPB",
  "5-MAPDB",
  "5-MDMA",
  "5-MeO-AMT",
  "5-MeO-DALT",
  "5-MeO-DiPT",
  "5-MeO-DMT",
  "5-MeO-MiPT",
  "5-MeO-\u03b1-ET",
  "5-Methoxymethylon",
  "5-OH-DMT",
  "5CI-AB-PINACA",
  "5CI-NNEI",
  "5F-AB PINACA",
  "5F-ADB-PINACA",
  "5F-ADBICA",
  "5F-AKB-48",
  "5F-AMB",
  "5F-APICA",
  "6-EAPB",
  "6-Fluor-AMT",
  "6-Fluor-DMT",
  "6-MAPB",
  "6-MAPDB",
  "6-Monoacetylmorphine",
  "7-amino-clonazepam",
  "7-amino-flunitrazepam",
  "7-APDB",
  "7-Dichloro-Tryptamin",
  "7-Fluortryptamin DALT",
  "7-Me-\u03b1-ET",
  "AB FUBINACA",
  "AB FUBINACA 2- fluorobenzyl isomer",
  "AB-001",
  "AB-005",
  "AB-CHMINACA",
  "AB-PINACA",
  "ACEA",
  "Acebutolol",
  "Acetone",
  "Acetyl-alpha-methylfentanyl",
  "Acetylcodeine",
  "Acetylfentanyl",
  "ACPA",
  "ADB-FUBINACA",
  "ADB-PINACA",
  "ADBICA",
  "AKB-48",
  "Alfentanil",
  "ALICB-122",
  "Allobarbital",
  "Alpha-Methylfentanyl",
  "Alpha-Methylthiofentanyl",
  "Alphenal",
  "Alprazolam",
  "Aluminium",
  "AM 694",
  "AM-1220",
  "AM-1248",
  "AM-2201",
  "AM-2201 benzimidazol analog",
  "AM-2201-2- hydroxyindol",
  "AM-2232",
  "AM-2233",
  "AM-624",
  "AMB-PICA",
  "Amisulpride",
  "Amitriptyline",
  "AMMI",
  "Amobarbital",
  "Amphetamine",
  "AMT",
  "Anhydroecgonine methylester (AEME / Crack)",
  "Aniracetam",
  "Antimony",
  "APICA",
  "Aprobarbital",
  "Aripiprazole",
  "Arsenic",
  "Atenolol",
  "Barbital",
  "Barbituric acid",
  "Barium",
  "BB-22",
  "Benperidol",
  "Benzedron",
  "Benzodiazepines",
  "Benzoylecgonine",
  "Benzoylecgonine (BZE)",
  "Benzphetamin",
  "Beryllium",
  "beta-hydroxy-3-methylfentanyl",
  "Beta-hydroxyfentanyl",
  "Betaxolol",
  "BHBA",
  "Bismuth",
  "bk-2C-B Bromo-DragonFLY",
  "bk-MDDMA",
  "BMDP",
  "Boldenone",
  "Bore",
  "Bromazepam",
  "Buphedron (MABP)*",
  "Buprenorphine",
  "Butabarbital",
  "Butalbital",
  "Butallylonal",
  "Butethal",
  "Butylon",
  "C1",
  "C10",
  "C2",
  "C3",
  "C3-allyl",
  "C4",
  "C5",
  "C5-cyclopropyl",
  "C6",
  "C7",
  "C8",
  "C8-phenethyl",
  "Cadmium",
  "Cannabidiol (CBD)",
  "Cannabinol (CBN)",
  "Carbamazepine",
  "Carfentanil",
  "Cathine",
  "Cathinone",
  "CC-2201",
  "Chlordiazepoxide",
  "Chlorpheniramine",
  "Chlorphentermin",
  "Chlorpromazine",
  "Chlorprothixene",
  "Chrome",
  "CI",
  "Citalopram",
  "Clobazam",
  "Clomipramine",
  "Clonazepam",
  "Clonidine",
  "Clotermin",
  "Clotiapine",
  "Clozapine",
  "CMP",
  "Cobalt",
  "Cocaethylene",
  "Cocaine",
  "Codeine",
  "Copper",
  "Core Class A+B",
  "CP 47 497",
  "CP 55 244",
  "CP 55 940",
  "Cumyl-5FPICA",
  "Cumyl-BICA",
  "Cumyl-PICA",
  "Cumyl-PINACA",
  "Cumyl-THPICA",
  "Cyamemazine",
  "Cyclizine Hydrochloride",
  "Cyclobarbital",
  "Cyclopal",
  "D2PM",
  "DBZP",
  "Deschloro-N-ethyl-ketamin",
  "Desipramine",
  "Desipreamine",
  "Desoxy-D2PM",
  "DET",
  "Detailed steroid screen",
  "Dextromethorphan",
  "DHEA",
  "Diazepam",
  "Dibutylon",
  "Diclofensin",
  "Diethylcathinon",
  "Dihydrocodeine",
  "Dimethocain",
  "Dimethylcathinon",
  "Dimethylone",
  "Diphenhydramine",
  "DiPT",
  "DL-4662",
  "DMMA",
  "DMT",
  "DOB",
  "DOC",
  "DOET",
  "DOI",
  "DOM",
  "Dosulepin",
  "DOT",
  "Doxepin",
  "Doxylamin",
  "Doxylamine",
  "DP",
  "DPT",
  "Drugs by LC-MS/MS level 3 - (Alfentanil, Amisulpride, Amitriptyline, Aripiprazole, Benperidol, Carbamazepine, Chlorpromazine, Chlorprothixene",
  "EAM-2201",
  "Ecgoninemethylester",
  "EDDP",
  "EG-018",
  "EMA",
  "enanthate",
  "EPEA",
  "epitestosterone",
  "Etaqualon",
  "Ethcathinon",
  "Ethylon",
  "Ethylphenidate",
  "Etomidate",
  "Eutylon",
  "FAB-144",
  "FDU-PB-22",
  "Fencamfamin",
  "Fentanyl",
  "Fentanyl N-oxide",
  "FLEA",
  "Flunitrazepam",
  "Fluoxetine",
  "Flupenthixol",
  "Fluphenazine",
  "Flupirtine",
  "Flurazepam",
  "Fluvoxamine",
  "FUB-144",
  "FUB-AKB48",
  "FUB-AMB",
  "FUB-JWH 018",
  "FUB-NPB-22",
  "Full Medical Screen - WP",
  "Gabapentin",
  "Gallium",
  "Germanium",
  "Haloperidol",
  "HDMP-28",
  "Heptabarbital",
  "Heroin",
  "Hexedron",
  "Hexethal",
  "Hexobarbital",
  "HMA",
  "HU 210",
  "Hydrocodone",
  "Hydromorphone",
  "Hydroxyzine",
  "I-AMB",
  "Imipramine",
  "Isopentedro",
  "Isopropyl Fentanyl",
  "Isopropylphenidate",
  "JWH-007",
  "JWH-015",
  "JWH-018",
  "JWH-018 N-(5-bromopentyl) analog",
  "JWH-019",
  "JWH-020",
  "JWH-022",
  "JWH-030",
  "JWH-073",
  "JWH-080",
  "JWH-081",
  "JWH-122",
  "JWH-180",
  "JWH-182",
  "JWH-200",
  "JWH-200 analog1",
  "JWH-203",
  "JWH-210",
  "JWH-213",
  "JWH-250",
  "JWH-251",
  "JWH-307",
  "JWH-368",
  "JWH-370",
  "JWH-387",
  "JWH-398",
  "JWH-412",
  "Ketamine",
  "Lead",
  "Led",
  "Levetiracetam",
  "Levomepromazine",
  "Lisdexamfetamine",
  "Lithium",
  "Loprazolam",
  "Lorazepam",
  "Lormetazaepam",
  "Lormetazepam",
  "LSD",
  "M-1438",
  "M-144",
  "MA-CHMINACA",
  "MAB-CHMINACA",
  "MAFP",
  "MAM-2201",
  "MAM-2201 N-(5-chloropentyl) analog",
  "Manganese",
  "Maprotiline",
  "Mazindol",
  "MBDB",
  "MBZP",
  "MCHB-1",
  "MDA",
  "MDAI",
  "MDEA",
  "MDMA",
  "MDMB-CHMICA",
  "MDMB-CHMINACA",
  "MDMB-FUBINACA",
  "MDP2P",
  "MDPBP",
  "MDPH",
  "MDPV",
  "Mebroqualon",
  "Medazepam",
  "Mefenorex",
  "Melperone",
  "MEM",
  "Mephedrone",
  "Mephentermin",
  "Mephobarbital",
  "Mepiprazol",
  "MEPIRAPIM",
  "Mercury",
  "Mescaline",
  "Mesterolone",
  "MET",
  "Metandienone",
  "Metenolone",
  "Methabarbital",
  "Methadone",
  "Methamphetamine",
  "Methaqualone",
  "Methcathinone",
  "Methyl-PBP",
  "Methylbenzodioxolylbutanamine",
  "Methylmethaqualon",
  "Methylphenobarbital",
  "Mianserin",
  "Midazolam",
  "MiPT",
  "Mirtazapine",
  "MMAI",
  "MMB-018",
  "MMB-2201",
  "MMDA",
  "MN-18",
  "MN-24",
  "MN-25-2-methyl derivatives",
  "MO-CHMINAC",
  "Moclobemide",
  "Modafinil",
  "Modalfinil",
  "Molybdenum",
  "Morphine",
  "MPM",
  "MTTA",
  "N-Desmethyltramadol",
  "N-Dimethyl-MDA",
  "N-Dimethylpentylon",
  "N-DMA",
  "N-DMC",
  "N-Ethyl-N-methylcathinon",
  "N-Ethylketamin",
  "N-Ethylnorpentedron",
  "N-Ethylpentylon",
  "N-Formyl-methamphetamin",
  "N-Hydroxy-MDA",
  "N-Methyl-2-AI",
  "N-Methylnantradol",
  "Nabilone",
  "Nabitan",
  "NAM",
  "Nandrolone",
  "Nandrolone decanoate",
  "Nandrolone phenylpropionate",
  "Nantradol",
  "Naphyron",
  "NEB",
  "NESS-0327",
  "NET",
  "Nickel",
  "NIDA-41020",
  "Nitrazepam",
  "NM2201",
  "NMT",
  "NNEI",
  "NOHA",
  "Norandrostenedione",
  "Norbuprenorphine",
  "Norclobazam",
  "Norcocaine",
  "Nordiazepam",
  "Norketamine",
  "Normephedron",
  "Norpethidine",
  "Norpropoxyphene",
  "Nortilidine",
  "Nortriptyline",
  "Noscapine",
  "NPA",
  "NPB-22",
  "NPS",
  "NRG-3",
  "O-4310",
  "O-Desmethyltramadol",
  "Olanzapine",
  "OMA",
  "OMMA",
  "Opipramol",
  "Oxazepam",
  "Oxycodone",
  "Oxymorphone",
  "p-Fluorofentanyl",
  "Palladium",
  "Paroxetine",
  "PB-22",
  "PCE",
  "PCPr",
  "Pentazocine",
  "Penthedron",
  "Pentobarbital",
  "Pentorex",
  "Pethidine",
  "pFPP",
  "Phencyclidine",
  "Phenmetrazin",
  "Phenobarbital",
  "Phentermin",
  "Phenylmethylbarbituric acid",
  "Phenylpiperazin",
  "Phenylpiracetam",
  "Pipamperone",
  "Pipradol",
  "Piritramid",
  "Platinum",
  "PMA",
  "PMMA",
  "PPMA",
  "PPP",
  "Pre-proceedings 7 - FTPP",
  "Pregabalin",
  "Pregabaline",
  "Probarbital",
  "Promazine",
  "Promethazine",
  "Propallylonal",
  "Propofol",
  "Propoxyphene",
  "Propylhexedrin",
  "Psilocybin",
  "PTI-1",
  "PTI-2",
  "PV10",
  "PV4",
  "PV8",
  "PV9",
  "PX 1",
  "PX 2",
  "R-MMC",
  "Ractopamide",
  "RCS-8",
  "Reboxetine",
  "Remifentanyl",
  "Rimonabant",
  "Risperidone",
  "Rolicyclidin",
  "Rubidium",
  "Scopolamine",
  "SDB-005",
  "SDB-006",
  "SDB-006 N-phenylanalog",
  "Secobarbital",
  "Selegilin",
  "Selenium",
  "SER-601",
  "Sertraline",
  "Sibutramin",
  "Sigmodal",
  "Silver",
  "SLV-319",
  "SLV-326",
  "SR-144528",
  "SR-147778",
  "Stanozolol",
  "Strontium",
  "STS-135",
  "Sulpiride",
  "Synthetic cannabinoids",
  "Talbutal",
  "Tellurium",
  "Temazepam",
  "Tenocyclidin",
  "Testosterone",
  "Testosterone acetate",
  "Testosterone benzoate",
  "Testosterone cypionate",
  "Testosterone decanoate",
  "Testosterone enanthate",
  "Testosterone phenylpropionate",
  "Testosterone propionate",
  "Tetrahydrocannabinol",
  "Tetrazepam",
  "Thallium",
  "THC-COOH",
  "THCCOOH",
  "Thialbarbital",
  "Thiamylal",
  "Thiobarbituric acid",
  "Thiofentanyl",
  "Thiopental",
  "Thiopropamin",
  "Thioridazine",
  "THJ",
  "THJ-018",
  "THJ-2201",
  "Tilidine",
  "Tin",
  "TMA",
  "TMA-2",
  "TMA-6",
  "Tramadol",
  "Tramadol (O-Desmethyltramadol, N-Desmethyltramadol, Tramadol)\"",
  "Trazadone",
  "Trazodone",
  "Trenbolone",
  "Triazolam",
  "Trimipramine",
  "Tungsten",
  "UR-12",
  "UR-144",
  "Uranium",
  "Vanadium",
  "Venlafaxine",
  "Viloxazine",
  "Vinbarbital",
  "Vinylbital",
  "WH-122 N-(4-pentenyl) analog",
  "WIN 55 21-2-2",
  "WIN-53365",
  "WIN-54",
  "XLR-11",
  "XLR-12",
  "Zaleplon",
  "Zalepon",
  "Zinc",
  "Ziprasidone",
  "Zolpidem",
  "Zopiclone",
  "Zopliclone",
  "Zotepine",
  "Zuclopenthixol)\"",
  "\u03b1-Dimethylamino-pentiophenon",
  "\u03b1-ET",
  "\u03b1-Ethylamino-pentiophenon",
  "\u03b1-Methylamino-hexanophenon",
  "\u03b1-PAPP",
  "\u03b1-PBP",
  "\u03b1-PBT",
  "\u03b1-PHP",
  "\u03b1-PipBP",
  "\u03b1-Propylamino-pentiophenon",
  "\u03b1-PVT"
];

export const BLOOD_PANELS: SimplePanel[] = [
  {
    "name": "Blood DOAs",
    "desc": "DOAs - Amphetamine, Methamphetamines, Benzodiazepines, Cannabis, Cocaine, Methadone, Opiates, Ketamine. (Lab may be able to test more, please ask if not on the list)"
  },
  {
    "name": "PEth",
    "desc": "Phosphatidylethanol - DIRECT biomarker\n~28 days prior to collection"
  },
  {
    "name": "CDT",
    "desc": "Carbohydrate Deficient Transferrin - Indirect biomarker\n~4 weeks prior to collection"
  },
  {
    "name": "LFT",
    "desc": "Liver Function Test - Indirect biomarker\nmeasures liver enzymes/proteins that become elevated/altered when the liver is damaged"
  },
  {
    "name": "FBC",
    "desc": "Full Blood Count - Indirect biomarker\nmeasures MCV (average RBC size)"
  },
  {
    "name": "GGT-CDTr",
    "desc": "Gamma-Glutamyl Transferase + Carbohydrate Deficient Transferrin"
  }
];

export const URINE_PANELS: SimplePanel[] = [
  {
    "name": "(WP) Urine 6 Panel",
    "desc": "Amphetamine, Methamphetamines, Benzodiazepines, Cannabis, Cocaine, Methadone, Propoxyphene, Opiates"
  },
  {
    "name": "(WP) V1. Urine 10 Panel",
    "desc": "Amphetamine, Benzodiazepines, Buprenorphine, Cannabis, Cocaine, Ketamine, Methamphetamine, Methadone, Opiates, K2/Spice"
  },
  {
    "name": "(WP) V2. Urine 10 Panel",
    "desc": "Amphetamine, Benzodiazepines, Buprenorphine, Cannabis, Cocaine, Ketamine, Methamphetamine, Methadone, Opiates, Tramadol"
  },
  {
    "name": "(WP) Urine 13 Panel",
    "desc": "Amphetamine, Methamphetamines, Benzodiazepines, Cannabis, Cocaine, Methadone, Propoxyphene, Phencyclidine, Opiates, Barbiturates, EDDP, Ketamine."
  },
  {
    "name": "(WP) Oral 6 Panel",
    "desc": "Amphetamine, Benzodiazepines, Cannabis, Cocaine, Methadone, Opiates"
  },
  {
    "name": "16 drug Unknown Substance",
    "desc": "Amphetamine, Benzodiazepines, Buprenorphine, Cocaine, Fentanyl, K2/Spice, Ketamine, Methadone, Methamphetamine, MDMA, Opiate, Oxycodone, Propoxyphene, Cannabis, Tramadol, Zolpidem"
  }
];

export const MEDICATIONS: Medication[] = [
  {
    "group": "Pharmaceuticals",
    "ingredient": "Aripiprazole",
    "brand": "Abilify"
  },
  {
    "group": "Amphetamine",
    "ingredient": "Amphetamine",
    "brand": "Adderall"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Nortriptyline",
    "brand": "Allegron"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Pregabalin",
    "brand": "Alzain"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Zolpidem",
    "brand": "Ambien"
  },
  {
    "group": "Amphetamine",
    "ingredient": "Amphetamine",
    "brand": "Amfexa"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Clomipramine",
    "brand": "Anafranil"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Benperidol",
    "brand": "Anquil"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Lorazepam",
    "brand": "Ativan"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Pregabalin",
    "brand": "Axalid"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Dextromethorphan",
    "brand": "Benylin"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Mianserin",
    "brand": "Bolvidon"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Midazolam",
    "brand": "Buccolam"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Melperone",
    "brand": "Buronil"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Clonidine",
    "brand": "Catapres"
  },
  {
    "group": "Cannabinoids",
    "ingredient": "Cannabinoids",
    "brand": "CBD/Hemp Products"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Citalopram",
    "brand": "Celexa"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Citalopram",
    "brand": "Cipramil"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Zuclopenthixol",
    "brand": "Clopixol"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Clozapine",
    "brand": "Clozaril"
  },
  {
    "group": "Opiates",
    "ingredient": "Codeine",
    "brand": "Co-codamol"
  },
  {
    "group": "Opiates",
    "ingredient": "Dihydrocodeine",
    "brand": "Co-dydramol"
  },
  {
    "group": "Opiates",
    "ingredient": "Codeine",
    "brand": "Codeine"
  },
  {
    "group": "Opiates",
    "ingredient": "Codeine",
    "brand": "Codeine phosphate"
  },
  {
    "group": "Opiates",
    "ingredient": "Codeine",
    "brand": "Codipar"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Dextromethorphan",
    "brand": "Covonia"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Carbamazepine",
    "brand": "Curatil"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Flurazepam",
    "brand": "Dalmane"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Clozapine",
    "brand": "Denzapine"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Flupentixol",
    "brand": "Depixol"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Levetiracetam",
    "brand": "Desitrend"
  },
  {
    "group": "Amphetamine",
    "ingredient": "Amphetamine",
    "brand": "Dexamphetamine"
  },
  {
    "group": "Amphetamine",
    "ingredient": "Amphetamine",
    "brand": "Dexedrine"
  },
  {
    "group": "Amphetamine",
    "ingredient": "Amphetamine",
    "brand": "Dextroamphetamine"
  },
  {
    "group": "Opiates",
    "ingredient": "Dihydrocodeine",
    "brand": "Dihydrocodeine"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Pipamperone",
    "brand": "Dipiperon"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Clonidine",
    "brand": "Dixarit"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Sulpiride",
    "brand": "Dolmatil"
  },
  {
    "group": "Methadone",
    "ingredient": "Methadone",
    "brand": "Dolophine"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Amitriptyline",
    "brand": "Domical"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Reboxetine",
    "brand": "Edronax"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Venlafaxine",
    "brand": "Efexor XL"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Amitriptyline",
    "brand": "Elavil"
  },
  {
    "group": "Amphetamine",
    "ingredient": "Amphetamine",
    "brand": "Elvanse"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Clotiapine",
    "brand": "Entumine"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Midazolam",
    "brand": "Epistatus"
  },
  {
    "group": "Narcotics by LC-MS/MS",
    "ingredient": "Buprenorphine",
    "brand": "Espranor"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Etomidate",
    "brand": "Etomidate-Lipuro"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Melperone",
    "brand": "Eunerpan"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Fluvoxamine",
    "brand": "Faverin"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Flupentixol",
    "brand": "Fluanxol"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Pentazocine",
    "brand": "Fortral"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Clobazam / Norclobazam",
    "brand": "Frisium"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Etomidate",
    "brand": "Hypnomidate"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Midazolam",
    "brand": "Hypnovel"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Imipramine",
    "brand": "Imipramine Hydrochloride"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Opipramol",
    "brand": "Insidon"
  },
  {
    "group": "Opiates",
    "ingredient": "Codeine",
    "brand": "Kapake"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Flupirtine",
    "brand": "Katadolon"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Levetiracetam",
    "brand": "Keppra"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Clonazepam",
    "brand": "Klonopin"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Chlorpromazine",
    "brand": "Largactil"
  },
  {
    "group": "Cannabinoids",
    "ingredient": "Cannabinoids",
    "brand": "Legally prescribed cannabis"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Amitriptyline",
    "brand": "Lentizol"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Chlordiazepoxide",
    "brand": "Libruim"
  },
  {
    "group": "Amphetamine",
    "ingredient": "Amphetamine",
    "brand": "Lisdexamfetamine"
  },
  {
    "group": "Amphetamine",
    "ingredient": "Amphetamine",
    "brand": "Lisdexamphetmaine"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Maprotiline",
    "brand": "Ludiomil"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Flupirtine",
    "brand": "Lupirtin"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Sertraline",
    "brand": "Lustral"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Pregabalin",
    "brand": "Lyrica"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Moclobemide",
    "brand": "Manerix"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Thioridazine",
    "brand": "Melleril"
  },
  {
    "group": "Opiates",
    "ingredient": "Codeine",
    "brand": "Mersyndol"
  },
  {
    "group": "Methadone",
    "ingredient": "Methadone",
    "brand": "Methadose"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Pregabalin",
    "brand": "Misabri"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Modafinil",
    "brand": "Modasomil"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Fluphenazine",
    "brand": "Modecate"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Modafinil",
    "brand": "Modiodal"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Nitrazepam",
    "brand": "Mogadon"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Trazodone",
    "brand": "Molipaxin"
  },
  {
    "group": "Opiates",
    "ingredient": "Morphine",
    "brand": "Morphine"
  },
  {
    "group": "Opiates",
    "ingredient": "Morphine",
    "brand": "MST"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Gabapentin",
    "brand": "Neurontin"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Dextromethorphan",
    "brand": "Night nurse"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Medazepam",
    "brand": "Nobrium"
  },
  {
    "group": "Opiates",
    "ingredient": "Codeine",
    "brand": "Nurofen Plus"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Risperidone",
    "brand": "Okedi"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Fluoxetine",
    "brand": "Olena"
  },
  {
    "group": "Opiates",
    "ingredient": "Morphine",
    "brand": "Oramorph"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Fluoxetine",
    "brand": "Oxactin"
  },
  {
    "group": "Opiates",
    "ingredient": "Oxycodone",
    "brand": "Oxycodone"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Midazolam",
    "brand": "Ozalin"
  },
  {
    "group": "Opiates",
    "ingredient": "Codeine",
    "brand": "Panadeine"
  },
  {
    "group": "Opiates",
    "ingredient": "Dihydrocodeine",
    "brand": "Paramol"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Clobazam / Norclobazam",
    "brand": "Perizam"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Desipramine",
    "brand": "Pertofran"
  },
  {
    "group": "Methadone",
    "ingredient": "Methadone",
    "brand": "Physeptone"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Opipramol",
    "brand": "Pramolan"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Dosulepin",
    "brand": "Prothiaden"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Modafinil",
    "brand": "Provigil"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Fluoxetine",
    "brand": "Prozac"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Fluoxetine",
    "brand": "Prozep"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Viloxazine",
    "brand": "Qelbree"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Alfentanil",
    "brand": "Rapifen"
  },
  {
    "group": "Opiates",
    "ingredient": "Dihydrocodeine",
    "brand": "Remedeine"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Temazepam",
    "brand": "Restoril"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Flupirtine",
    "brand": "Retense"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Risperidone",
    "brand": "Risperdal"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Risperidone",
    "brand": "Risperdal Consta"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Clonazepam",
    "brand": "Rivotril"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Dextromethorphan",
    "brand": "Robitussin"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Flunitrazepam",
    "brand": "Rohypnol"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Flunitrazepam",
    "brand": "Roofies"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Medazepam",
    "brand": "Rudotel"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Paroxetine",
    "brand": "Seroxat"
  },
  {
    "group": "Opiates",
    "ingredient": "Oxycodone",
    "brand": "Shortec"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Doxepin",
    "brand": "Silenor"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Doxepin",
    "brand": "Sinepin"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Amisulpride",
    "brand": "Solian"
  },
  {
    "group": "Opiates",
    "ingredient": "Codeine",
    "brand": "Solpadol"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Zaleplon",
    "brand": "Sonata"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Zolpidem",
    "brand": "Stilnox"
  },
  {
    "group": "Narcotics by LC-MS/MS",
    "ingredient": "Buprenorphine",
    "brand": "Suboxone"
  },
  {
    "group": "Narcotics by LC-MS/MS",
    "ingredient": "Buprenorphine",
    "brand": "Subutex"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Sulpiride",
    "brand": "Sulpor"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Trimipramine",
    "brand": "Surmontil"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Opipramol",
    "brand": "Sympramol"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Carbamazepine",
    "brand": "Tegretol"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Temazepam",
    "brand": "Tenox"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Imipramine",
    "brand": "Tofranil"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Mianserin",
    "brand": "Tolvon"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Chlorprothixene",
    "brand": "Truxal"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Amitriptyline",
    "brand": "Tryptizol"
  },
  {
    "group": "Opiates",
    "ingredient": "Codeine",
    "brand": "Tyrex"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Diazepam",
    "brand": "Valium"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Tilidine / Nortilidine",
    "brand": "Valoron"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Tilidine / Nortilidine",
    "brand": "Valtran"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Midazolam",
    "brand": "Versed"
  },
  {
    "group": "Amphetamine",
    "ingredient": "Amphetamine",
    "brand": "Vyvanse"
  },
  {
    "group": "Benzodiazepines and sedatives",
    "ingredient": "Alprazolam",
    "brand": "Xanax"
  },
  {
    "group": "Opiates",
    "ingredient": "Codeine",
    "brand": "Zapain"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Clozapine",
    "brand": "Zaponex"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Ziprasidone",
    "brand": "Zeldox"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Zopiclone",
    "brand": "Zimovane"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Ziprasidone",
    "brand": "Ziprasidone"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Mirtazapine",
    "brand": "Zispin"
  },
  {
    "group": "Pharmaceuticals",
    "ingredient": "Zotepine",
    "brand": "Zoleptil"
  },
  {
    "group": "Opiates",
    "ingredient": "Morphine",
    "brand": "Zomorph"
  }
];

export const QUESTION_SETS: QuestionSet[] = [
  {
    "question": "Child Questions",
    "answer": "Thank you for your request to perform testing on a child. Please be aware, drug and alcohol testing in children are always treated as complex cases due to the physical differences in children compared to adults, which affect how the results are interpreted. \n\nAs per our protocols, please see below the information we will require to perform this testing, along with our recommendations for the best possible testing outcome:\nDoes the mother use drugs, and if so which drugs?\nDoes the mother declare she currently breastfeeds the child, or has done in the past? If so when?\nDoes the father/partner use drugs? And do they live in the same household as the child?\nHas the mother and/or father/partner already been tested for drug use, if so please provide a copy of the report. \nPlease confirm the specific concern, be it accidental ingestion, environmental exposure, passive exposure or being actively drugged etc. \nIf they have been removed from the parents care, please provide a date for this.\n\nIt is our strong recommendation, depending on the case circumstances, that the parents/carers be tested alongside the child to provide further evidence for our experts to use in the interpretation of the child\u2019s results."
  },
  {
    "question": "Braid Questions",
    "answer": "When was the sampled hair unbraided?\nHow long was this hair previously braided? Was this continuous or periodically removed and re-braided?\nWas the hair washed/brushed/combed between being unbraided and being sampled?\nWas any of the braided hair synthetic or fully your own hair?\nWere any additional products/treatments to those declared utilised in the braiding or un-braiding of the hair?"
  },
  {
    "question": "Why do we test Methamphetamine and Amphetamine together?",
    "answer": "Amphetamine is a drug in its own right, as well as a metabolite of methamphetamine. DNA Legal have opted to always test amphetamine and methamphetamine alongside each other. Doing this allows for the toxicologist to more accurately conclude the source of any detected amphetamine and/or methamphetamine."
  },
  {
    "question": "Why do we need to test EtG & FAEE alongside?",
    "answer": "As standard practise, DNA Legal test head hair for EtG and EtPa alcohol markers (EtPa being the most specific of the four compounds covered under the name FAEE).\n\nChemical hair treatments, such as hair dye, can decrease the concentration of hair alcohol markers present within the hair. Chemical hair treatments have a greater impact on the concentration of EtG than on EtPa, due to the way EtG is incorporated into the hair shaft and the chemical properties of each compound. Because of this, when chemical hair treatment is declared/suspected, it is recommended that EtG and EtPa be analysed together, as EtPa is more resistant to the effects of hair treatment and therefore can be used when a false negative result is suspected.\n\nDue to the way EtPa is incorporated into the hair, EtPa concentrations can be affected (increased) by the use of alcohol-containing hair products. On the other hand, unlike EtPa, EtG is not impacted by alcohol-containing products."
  }
];
