import { StructureCommon } from "@domifa/common";
import { CountryISO } from "@khazii/ngx-intl-tel-input";

export const STRUCTURE_MOCK: StructureCommon = {
  id: 1,
  createdAt: new Date(),
  adresse: "1 rue de l'océan",
  adresseCourrier: {
    actif: true,
    adresse: "12 rue des bois, porte gauche",
    ville: "Marseille",
    codePostal: "13000",
  },
  agrement: null,
  capacite: null,
  codePostal: "92600",
  complementAdresse: "batiment B",
  departement: "92",
  region: "11",
  email: "ccas.test@yopmail.com",
  nom: "CCAS de Test",
  options: { numeroBoite: false, surnom: false },
  telephone: {
    numero: "0602030405",
    countryCode: CountryISO.France,
  },
  acceptTerms: new Date(),
  timeZone: "Europe/Paris",
  responsable: { nom: "Jean", prenom: "Thomson", fonction: "PDG" },
  structureType: "ccas",
  ville: "Asnieres-sur-seine",
  lastLogin: new Date(),
  sms: {
    enabledByDomifa: false,
    enabledByStructure: false,
    senderDetails: "",
    senderName: "",
  },
  portailUsager: {
    usagerLoginUpdateLastInteraction: false,
    enabledByDomifa: true,
    enabledByStructure: false,
  },
};
