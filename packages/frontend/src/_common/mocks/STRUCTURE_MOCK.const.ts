import { CountryISO } from "ngx-intl-tel-input";
import { StructureCommon } from "../model";

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
  options: { numeroBoite: false, usagerLoginUpdateLastInteraction: false },
  telephone: {
    numero: "0602030405",
    countryCode: CountryISO.France,
  },
  timeZone: "Europe/Paris",
  responsable: { nom: "Jean", prenom: "Thomson", fonction: "PDG" },
  structureType: "ccas",
  ville: "Asnieres-sur-seine",
  sms: {
    enabledByDomifa: false,
    enabledByStructure: false,
    senderDetails: "",
    senderName: "",
  },
  portailUsager: {
    enabledByDomifa: true,
    enabledByStructure: false,
  },
};
