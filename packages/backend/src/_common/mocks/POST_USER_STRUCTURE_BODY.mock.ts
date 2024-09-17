import {
  UserStructureRole,
  StructureType,
  UserStructure,
} from "@domifa/common";

export const POST_USER_STRUCTURE_BODY: Partial<UserStructure> = {
  password: "xxx",
  email: "preprod.domifa@fabrique.social.gouv.fr",
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
    email: "preprod.domifa@fabrique.social.gouv.fr",
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
      schedule: {
        monday: false,
        tuesday: true,
        wednesday: false,
        thursday: true,
        friday: false,
      },
    },
    portailUsager: {
      enabledByDomifa: false,
      enabledByStructure: false,
      usagerLoginUpdateLastInteraction: false,
    },
    organismeType: null,
    lastLogin: null,
    timeZone: "Europe/Paris",
    acceptTerms: new Date(),
    telephone: { numero: "0602030405", countryCode: "fr" },
  },
  structureId: 100,
  userRightStatus: "super-admin-domifa",
};