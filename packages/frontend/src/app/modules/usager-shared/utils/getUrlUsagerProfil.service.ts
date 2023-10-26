import { ETAPES_DEMANDE_URL, UsagerLight } from "../../../../_common/model";
import { UsagerFormModel } from "../interfaces";

export const getUrlUsagerProfil = (
  usager?: UsagerLight | UsagerFormModel
): string => {
  if (!usager?.decision) {
    return "/usager/nouveau";
  }
  const { decision, ref, etapeDemande } = usager;
  return decision.statut === "INSTRUCTION" ||
    decision.statut === "ATTENTE_DECISION"
    ? `/usager/${ref}/edit/${ETAPES_DEMANDE_URL[etapeDemande]}`
    : `/profil/general/${ref}`;
};
