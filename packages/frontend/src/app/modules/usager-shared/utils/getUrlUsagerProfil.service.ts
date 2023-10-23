import { ETAPES_DEMANDE_URL, UsagerLight } from "../../../../_common/model";

export const getUrlUsagerProfil = (usager?: UsagerLight): string => {
  if (!usager?.decision) {
    return "/usager/nouveau";
  }

  const { decision, ref, typeDom, etapeDemande } = usager;

  return decision.statut === "INSTRUCTION" && typeDom !== "RENOUVELLEMENT"
    ? `/usager/${ref}/edit/${ETAPES_DEMANDE_URL[etapeDemande]}`
    : `/profil/general/${ref}`;
};
