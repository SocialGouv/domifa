import { usagerRepository, UsagerTable } from "../../database";
import { USAGER_DEFAULT_OPTIONS } from "../../database/services/usager/constants/USAGER_DEFAULTS.const";

export const usagersCreator = { findNextUsagerRef, setUsagerDefaultAttributes };
async function findNextUsagerRef(structureId: number): Promise<number> {
  const maxRef = await usagerRepository.max({
    maxAttribute: "ref",
    where: {
      structureId,
    },
  });
  const nextRef = maxRef ? maxRef + 1 : 1;
  return nextRef;
}

function setUsagerDefaultAttributes(usager: UsagerTable) {
  if (!usager.ayantsDroits) usager.ayantsDroits = [];
  if (!usager.historique) usager.historique = [];
  if (!usager.rdv) usager.rdv = null;
  if (!usager.entretien) usager.entretien = {};
  if (!usager.options) {
    usager.options = USAGER_DEFAULT_OPTIONS;
  }

  if (!usager.langue || usager.langue === "") {
    usager.langue = null;
  }

  if (!usager.lastInteraction)
    usager.lastInteraction = {
      dateInteraction: new Date(),
      colisIn: 0,
      courrierIn: 0,
      recommandeIn: 0,
      enAttente: false,
    };
}
