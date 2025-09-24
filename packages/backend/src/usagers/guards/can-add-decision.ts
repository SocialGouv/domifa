import { UserStructureRole, UsagerDecisionStatut } from "@domifa/common";

export const canAddDecision = (
  userRole: UserStructureRole,
  decisionStatus: UsagerDecisionStatut
): boolean => {
  const instructRoles: UserStructureRole[] = ["simple", "responsable", "admin"];
  const validateOrRefuseRoles: UserStructureRole[] = ["responsable", "admin"];

  const canInstruct = instructRoles.includes(userRole);
  const canValidateOrRefuse = validateOrRefuseRoles.includes(userRole);

  const permissions: { [key in UsagerDecisionStatut]: boolean } = {
    INSTRUCTION: canInstruct,
    ATTENTE_DECISION: canInstruct,
    RADIE: canInstruct,
    VALIDE: canValidateOrRefuse,
    REFUS: canValidateOrRefuse,
  };

  return permissions[decisionStatus] || false;
};
