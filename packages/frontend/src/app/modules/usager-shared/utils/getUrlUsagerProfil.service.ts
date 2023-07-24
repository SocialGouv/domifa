import { ETAPES_DEMANDE_URL, UsagerLight } from "../../../../_common/model";

export const getUrlUsagerProfil = (usager?: UsagerLight): string => {
  if (!usager?.decision) {
    return "/usager/nouveau";
  }

  const { decision, ref, typeDom, etapeDemande } = usager;

  if (decision.statut === "ATTENTE_DECISION") {
    return `/usager/${ref}/edit/decision`;
  }

  if (decision.statut === "INSTRUCTION") {
    return typeDom === "RENOUVELLEMENT"
      ? `/profil/general/${ref}`
      : `/usager/${ref}/edit/${ETAPES_DEMANDE_URL[etapeDemande]}`;
  }

  return `/profil/general/${ref}`;
};
