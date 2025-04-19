import { CountryISO } from "@khazii/ngx-intl-tel-input";

import {
  StructureType,
  UserStructure,
  UserStructureRole,
} from "@domifa/common";

export const USER_STRUCTURE_MOCK: UserStructure = {
  password: "xxx",
  uuid: "xxx",
  email: "preprod.domifa@fabrique.social.gouv.fr",
  mails: {
    guide: false,
    import: false,
  },
  domifaVersion: "1",
  acceptTerms: new Date(),
  id: 1,
  nom: "TEST",
  prenom: "TEST",
  lastLogin: new Date(),
  passwordLastUpdate: new Date(),
  verified: true,
  role: "admin" as UserStructureRole,
  structure: {
    id: 100,
    timeZone: "Europe/Paris",
    createdAt: new Date(),
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
    lastLogin: null,
    options: { numeroBoite: false, surnom: false },
    telephone: { numero: "0134334410", countryCode: CountryISO.France },
    responsable: { nom: "Pompei", prenom: "Roma", fonction: "Directrice" },
    structureType: "asso" as StructureType,
    organismeType: "HOPITAL",
    ville: "Cergy",
    acceptTerms: new Date(),
    sms: {
      senderName: "DOMIFA",
      senderDetails: "CCAS",
      enabledByDomifa: true,
      enabledByStructure: false,
      schedule: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
      },
    },
    portailUsager: {
      usagerLoginUpdateLastInteraction: false,
      enabledByDomifa: true,
      enabledByStructure: false,
    },
  },
  structureId: 100,
};
