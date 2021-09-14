import { StructureType, UserStructure, UserStructureRole } from "./../model";

export const userMock: UserStructure = {
  password: "xxx",
  email: "ccastest@yopmail.com",
  mail: {
    guide: false,
    import: false,
  },

  id: 1,
  nom: "TEST",
  prenom: "TEST",
  lastLogin: new Date(),
  passwordLastUpdate: new Date(),
  verified: true,
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
    email: "ccastest@yopmail.com",
    nom: "DomiFa Compte Test",
    options: { numeroBoite: false },
    phone: "0134334410",
    responsable: { nom: "Pompei", prenom: "Roma", fonction: "Directrice" },
    structureType: "asso" as StructureType,
    ville: "Cergy",
    sms: {
      senderName: "DOMIFA",
      senderDetails: "CCAS",
      enabledByDomifa: true,
      enabledByStructure: false,
    },
  },
  structureId: 100,
};
