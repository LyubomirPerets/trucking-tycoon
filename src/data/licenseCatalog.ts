import type { LicenseType } from "../types";

export interface LicenseCatalogEntry {
  type: LicenseType;
  label: string;
  description: string;
  scoped: boolean; // true = purchased per-state, false = national
  priceCents: number;
  annualRenewalCostCents: number;
}

export const LICENSE_CATALOG: LicenseCatalogEntry[] = [
  {
    type: "intrastateOperatingAuthority",
    label: "Intrastate Operating Authority",
    description: "Required to haul freight within a single state.",
    scoped: true,
    priceCents: 50_000,
    annualRenewalCostCents: 15_000,
  },
  {
    type: "interstateOperatingAuthority",
    label: "Interstate Operating Authority (MC Number)",
    description: "Required to haul freight across state lines.",
    scoped: false,
    priceCents: 300_000,
    annualRenewalCostCents: 75_000,
  },
  {
    type: "hazmatEndorsement",
    label: "Hazmat Endorsement",
    description: "Required to haul hazardous materials.",
    scoped: false,
    priceCents: 150_000,
    annualRenewalCostCents: 40_000,
  },
  {
    type: "oversizeLoadPermit",
    label: "Oversize Load Permit",
    description: "Required to haul oversized cargo.",
    scoped: true,
    priceCents: 80_000,
    annualRenewalCostCents: 20_000,
  },
  {
    type: "refrigeratedFreightCert",
    label: "Refrigerated Freight Certification",
    description: "Required to haul temperature-controlled cargo.",
    scoped: false,
    priceCents: 120_000,
    annualRenewalCostCents: 30_000,
  },
];
