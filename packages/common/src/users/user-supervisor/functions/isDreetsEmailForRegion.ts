import { DREETS_EMAIL_DOMAINS } from "../constants/DREETS_EMAIL_DOMAINS.const";
import { isNominativeGouvEmail } from "./isNominativeGouvEmail";

export const getDreetsEmailDomains = (region: string): readonly string[] =>
  DREETS_EMAIL_DOMAINS[region] ?? [];

// Regions missing from the allowlist stay managed by the DomiFa team
export const isDreetsSelfServiceRegion = (region: string): boolean =>
  getDreetsEmailDomains(region).length > 0;

export const isDreetsEmailForRegion = (
  email: string | null | undefined,
  region: string
): boolean => {
  // Same xxx@yyy.gouv.fr shape as the DDETS addresses
  if (!isNominativeGouvEmail(email)) {
    return false;
  }
  const domain = (email as string).trim().toLowerCase().split("@")[1];
  return getDreetsEmailDomains(region).includes(domain);
};
