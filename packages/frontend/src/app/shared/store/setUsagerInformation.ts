import {
  Usager,
  USAGER_DECISION_STATUT_LABELS,
  USAGER_DECISION_STATUT_COLORS,
  getRdvInfo,
  UsagerOptions,
  getEcheanceInfo,
} from "@domifa/common";
import { Decision, Rdv } from "../../modules/usager-shared/interfaces";
import { countStandByInteractions } from "../../modules/usager-shared/utils";
import { formatInternationalPhoneNumber } from "../phone";
import { Telephone } from "../../../_common/model";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setUsagerInformation = (usager: Usager): any => {
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
    echeanceInfos: getEcheanceInfo(usager),
    rdvInfo: getRdvInfo({
      rdv: usager.rdv,
      etapeDemande: usager.etapeDemande,
    }),
    standByInteractions: countStandByInteractions(usager.lastInteraction),
    historique: [],
    options: new UsagerOptions(usager.options),
    rdv: new Rdv(usager.rdv),
    dateNaissance: new Date(usager?.dateNaissance),
    entretien: null,
  };
};
