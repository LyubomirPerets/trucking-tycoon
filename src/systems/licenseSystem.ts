import type { License, LicenseType } from "../types";
import { LICENSE_CATALOG } from "../data/licenseCatalog";

export function isLicenseActive(license: License, day: number): boolean {
  return license.expiresOnDay > day;
}

/**
 * Does the company hold an active license of this type that covers the
 * given state? National (non-scoped) licenses cover every state.
 */
export function hasLicense(
  licenses: License[],
  type: LicenseType,
  day: number,
  relevantStateCode: string
): boolean {
  const catalogEntry = LICENSE_CATALOG.find((e) => e.type === type);
  return licenses.some(
    (l) =>
      l.type === type &&
      isLicenseActive(l, day) &&
      (!catalogEntry?.scoped || l.stateCode === relevantStateCode)
  );
}

export function hasAllRequiredLicenses(
  licenses: License[],
  requiredLicenses: LicenseType[],
  day: number,
  relevantStateCode: string
): boolean {
  return requiredLicenses.every((type) => hasLicense(licenses, type, day, relevantStateCode));
}
