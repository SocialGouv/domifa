import { Usager } from "@domifa/common";
import { usagerRepository } from "../../database";

export const usagersCreator = { findNextUsagerRef, setUsagerDefaultAttributes };
async function findNextUsagerRef(structureId: number): Promise<number> {
  const usager = await usagerRepository.findOne({
    where: {
      structureId,
    },
    order: { ref: "DESC" },
    select: ["ref"],
  });
  return usager?.ref ? usager?.ref + 1 : 1;
}

function setUsagerDefaultAttributes(usager: Partial<Usager>): void {
  usager.options = {
    transfert: {
      actif: false,
      nom: null,
      adresse: null,
      dateDebut: null,
      dateFin: null,
    },
    procurations: [],
    npai: {
      actif: false,
      dateDebut: null,
    },
    portailUsagerEnabled: false,
  };
  usager.typeDom = usager?.typeDom ?? "PREMIERE_DOM";
  usager.pinnedNote = null;
  usager.referrerId = null;

  if (!usager.ayantsDroits) {
    usager.ayantsDroits = [];
  }

  if (!usager.historique) {
    usager.historique = [];
  }

  if (!usager.rdv) {
    usager.rdv = null;
  }

  if (!usager?.telephone) {
    usager.telephone = {
      countryCode: "fr",
      numero: null,
    };
  }

  if (!usager.langue || usager.langue === "") {
    usager.langue = null;
  }

  if (!usager.lastInteraction) {
    usager.lastInteraction = {
      dateInteraction: new Date(),
      colisIn: 0,
      courrierIn: 0,
      recommandeIn: 0,
      enAttente: false,
    };
  }
}
