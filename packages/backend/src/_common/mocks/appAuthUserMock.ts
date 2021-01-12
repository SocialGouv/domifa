import { AppAuthUser } from "../model";

export const appAuthUserMock: AppAuthUser = {
  email: "mocked-user-domifa@yopmail.com",
  id: 743,
  nom: "USER",
  prenom: "USER NOM",
  role: "admin",
  verified: true,
  structure: {
    responsable: {
      fonction: "Président",
      nom: "Nom président.ee",
      prenom: "Prénom président.e",
    },
    adresse: "10 RUE DES BOIS",
    agrement: "20190909",
    codePostal: "93430",
    complementAdresse: "PORTE DROITE",
    departement: "93",
    email: "ccastest@yopmail.com",
    nom: "TEST TEST ASSO",
    phone: "010101010101",
    structureType: "asso",
    ville: "Villetaneuse",
    capacite: 200,
    id: 1,

    options: {
      numeroBoite: false,
    },
    region: "11",
    adresseCourrier: {
      actif: true,
      adresse: "10 rue Gresset – BP 80419",
      ville: "Amiens Cedex 1",
      codePostal: "80004",
    },
  },
  structureId: 1,
};
