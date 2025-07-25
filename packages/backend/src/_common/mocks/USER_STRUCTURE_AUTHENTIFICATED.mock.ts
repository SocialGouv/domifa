import { UserFonction } from "@domifa/common";
import { UserStructureAuthenticated } from "../model";

export const USER_STRUCTURE_AUTH: UserStructureAuthenticated = {
  id: 1,
  uuid: "admin-uuid-123",
  nom: "Admin",
  prenom: "Test",
  email: "admin@test.com",
  role: "simple",
  structureId: 1,
  verified: true,
  createdAt: new Date(),
  lastLogin: new Date(),
  fonction: UserFonction.PRESIDENT,
  fonctionDetail: null,
  acceptTerms: new Date(),
  _userProfile: "structure",
  _userId: 1,
  structure: {
    id: 1,
    nom: "Test Structure",
    adresse: "Test Address",
    ville: "Test City",
    codePostal: "12345",
    departement: "01",
    region: "01",
    email: "structure@test.com",
    structureType: "asso",
    capacite: 100,
    agrement: "123456",
    responsable: {
      nom: "Responsable",
      prenom: "Test",
      fonction: "Directeur",
    },
    options: {
      numeroBoite: false,
      surnom: false,
    },
    sms: {
      senderName: "TEST",
      senderDetails: "Test",
      enabledByDomifa: false,
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
      enabledByDomifa: false,
      enabledByStructure: false,
      usagerLoginUpdateLastInteraction: false,
    },
    organismeType: null,
    lastLogin: null,
    timeZone: "Europe/Paris",
    acceptTerms: new Date(),
    telephone: {
      numero: "0123456789",
      countryCode: "fr",
    },
    siret: "12345678901234",
    adresseCourrier: {
      actif: false,
      adresse: "",
      ville: "",
      codePostal: "",
    },
    complementAdresse: null,
  },
};
