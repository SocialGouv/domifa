import { Structure } from "../../app/modules/structures/structure.interface";
import { AppUser } from "../model";

export const userMock: AppUser = {
  email: "riffi.yassine@gmail.com",
  id: 743,
  nom: "USER",
  prenom: "USER NOM",
  role: "admin",
  lastLogin: new Date(),
  password: "",
  passwordLastUpdate: new Date(),
  verified: true,
  mail: {
    guide: true,
    import: true,
  },
  temporaryTokens: {},
  structure: new Structure({
    _id: "5dcd8b0d9641e6001b903f57",
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
      colis: false,
      customId: true,
      numeroBoite: false,
      rattachement: true,
    },
    region: "11",
    adresseCourrier: {
      actif: true,
      adresse: "10 rue Gresset – BP 80419",
      ville: "Amiens Cedex 1",
      codePostal: "80004",
    },
  }),
  structureId: 1,
};
