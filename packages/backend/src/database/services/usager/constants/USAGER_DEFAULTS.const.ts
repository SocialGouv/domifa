import { UsagerPreferenceContact } from "./../../../../_common/model/usager/UsagerPreferenceContact.type";
import { UsagerOptions } from "../../../../_common/model";
export const USAGER_DEFAULT_OPTIONS: UsagerOptions = {
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

export const USAGER_DEFAULT_PREFERENCE: UsagerPreferenceContact = {
  contactByPhone: false,
  telephone: {
    countryCode: "fr",
    numero: "",
  },
};
