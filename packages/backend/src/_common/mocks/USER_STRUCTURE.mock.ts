import { UserStructureRole, StructureType } from "@domifa/common";

export const USER_STRUCTURE_MOCK = {
  password: "xxx",
  email: "s1-admin@yopmail.com",
  id: 1,
  nom: "TEST",
  prenom: "TEST",
  role: "admin" as UserStructureRole,
  structure: {
    id: 100,
    adresse: "3 place olympe de gouges",
    adresseCourrier: {
      actif: true,
      ville: "Cergy Pontoise Cedex",
      adresse: "3 place des bois",
      codePostal: "95801",
    },
    agrement: "01010101",
    capacite: 20000,
    codePostal: "95801",
    complementAdresse: "BP 48000",
    departement: "95",
    region: "11",
    email: "s1-admin@yopmail.com",
    nom: "DomiFa Compte Test",
    options: { numeroBoite: false, surnom: false },
    responsable: { nom: "Pompei", prenom: "Roma", fonction: "Directrice" },
    structureType: "asso" as StructureType,
    ville: "Cergy",
    sms: {
      senderName: "DOMIFA",
      senderDetails: "CCAS",
      enabledByDomifa: true,
      enabledByStructure: false,
    },
    portailUsager: {
      enabledByDomifa: false,
      enabledByStructure: false,
    },
  },
  structureId: 100,
};
