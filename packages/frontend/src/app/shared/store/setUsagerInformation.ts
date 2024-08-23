import {
  Usager,
  INTERACTIONS_IN,
  USAGER_DECISION_STATUT_LABELS,
  USAGER_DECISION_STATUT_COLORS,
  getRdvInfos,
} from "@domifa/common";
import { Options } from "../../modules/usager-shared/interfaces";
import { getEcheanceInfos } from "../../modules/usager-shared/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setUsagerInformation = (usager: Usager): any => {
  let totalInteractionsEnAttente = 0;
  if (usager?.lastInteraction) {
    INTERACTIONS_IN.forEach((interaction) => {
      totalInteractionsEnAttente += usager.lastInteraction[interaction];
    });
  }

  return {
    ...usager,
    statusInfo: {
      text: USAGER_DECISION_STATUT_LABELS[usager?.decision?.statut],
      color: USAGER_DECISION_STATUT_COLORS[usager?.decision?.statut],
    },
    echeanceInfos: getEcheanceInfos(usager),
    rdvInfos: getRdvInfos({
      rdv: usager.rdv,
      etapeDemande: usager.etapeDemande,
    }),
    totalInteractionsEnAttente,
    historique: [],
    options: new Options(usager.options),
    rdv: null,
    entretien: null,
  };
};
