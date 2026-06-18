import { SuspiciousFilterUserType } from "../types/suspicious-activity-log";

export const SUSPICIOUS_FILTER_USER_TYPES: SuspiciousFilterUserType[] = [
  "user_structure",
  "user_supervisor",
  "usager",
  "anonymous",
  "system",
];

export const SUSPICIOUS_FILTER_USER_TYPE_LABELS: Record<
  SuspiciousFilterUserType,
  string
> = {
  user_structure: "Structure",
  user_supervisor: "Superviseur",
  usager: "Domicilié",
  anonymous: "Inconnu",
  system: "Système",
};
