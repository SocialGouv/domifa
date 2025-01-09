import {
  Usager,
  INTERACTIONS_IN,
  USAGER_DECISION_STATUT_LABELS,
  USAGER_DECISION_STATUT_COLORS,
  getRdvInfos,
} from "@domifa/common";
import { Decision, Options } from "../../modules/usager-shared/interfaces";
import { getEcheanceInfos } from "../../modules/usager-shared/utils";
import { formatInternationalPhoneNumber } from "../phone";
import { Telephone } from "../../../_common/model";

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
    decision: new Decision(usager.decision),
    lastInteraction: {
      ...usager.lastInteraction,
      dateInteraction: usager?.lastInteraction?.dateInteraction
        ? new Date(usager.lastInteraction.dateInteraction)
        : null,
    },
    phoneNumber: formatInternationalPhoneNumber(usager?.telephone as Telephone),
    echeanceInfos: getEcheanceInfos(usager),
    rdvInfos: getRdvInfos({
      rdv: usager.rdv,
      etapeDemande: usager.etapeDemande,
    }),
    totalInteractionsEnAttente,
    historique: [],
    options: new Options(usager.options),
    rdv: null,
    dateNaissance: new Date(usager?.dateNaissance),
    entretien: null,
  };
};
