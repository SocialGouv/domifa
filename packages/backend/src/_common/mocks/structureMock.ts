import { StructureCommon } from "../model";

export const structureMock: StructureCommon = {
  id: 1,
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
  options: { numeroBoite: false },
  phone: "0602030405",
  responsable: { nom: "Jean", prenom: "Thomson", fonction: "PDG" },
  structureType: "ccas",
  ville: "Asnieres-sur-seine",
  sms: {
    enabledByDomifa: false,
    enabledByStructure: false,
    senderDetails: "",
    senderName: "",
  },
};
