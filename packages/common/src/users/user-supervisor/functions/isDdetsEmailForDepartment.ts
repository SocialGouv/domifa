import { DDETS_EMAIL_DOMAINS } from "../constants/DDETS_EMAIL_DOMAINS.const";
import { isNominativeGouvEmail } from "./isNominativeGouvEmail";

export const getDdetsEmailDomains = (department: string): readonly string[] =>
  DDETS_EMAIL_DOMAINS[department] ?? [];

// Departments missing from the allowlist stay managed by the DomiFa team
export const isDdetsSelfServiceDepartment = (department: string): boolean =>
  getDdetsEmailDomains(department).length > 0;

export const isDdetsEmailForDepartment = (
  email: string | null | undefined,
  department: string
): boolean => {
  if (!isNominativeGouvEmail(email)) {
    return false;
  }
  const domain = (email as string).trim().toLowerCase().split("@")[1];
  return getDdetsEmailDomains(department).includes(domain);
};
