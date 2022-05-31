import { CreateUsagerDto } from "../../../usagers/dto";
import { UsagerLight } from "../../model/usager/UsagerLight.type";
// Test OK 1
export const POST_USAGER: {
  payload: CreateUsagerDto;
  response: UsagerLight;
} = {
  payload: {
    ayantsDroits: [
      {
        lien: "ENFANT",
        nom: "Nom AD 1 ",
        prenom: "Prénom AD 1 ",
        dateNaissance: new Date("2022-05-02T00:00:00.000Z"),
      },
    ],
    langue: "ar",
    dateNaissance: new Date("2022-05-05"),
    customRef: null,
    email: "test@test.fr",
    nom: "Nom test OK ",
    phone: "0606060606",
    preference: { phone: false, phoneNumber: null },
    prenom: "Prénom test OK ",
    sexe: "homme",
    surnom: "Surnom ",
    villeNaissance: "Monaco",
  },
  response: {
    uuid: null,
    createdAt: new Date("2022-05-05T07:15:36.590Z"),
    updatedAt: new Date("2022-05-05T07:15:36.590Z"),
    version: 1,
    ayantsDroits: [
      {
        lien: "ENFANT",
        nom: "Nom AD 1",
        prenom: "Prénom AD 1",
        dateNaissance: new Date("2022-05-02T00:00:00.000Z"),
      },
    ],
    langue: "ar",
    dateNaissance: new Date("2022-05-05T00:00:00.000Z"),
    customRef: "17",
    email: "test@test.fr",
    nom: "Nom test OK",
    phone: "0606060606",
    preference: { phone: false, phoneNumber: null },
    prenom: "Prénom test OK",
    sexe: "homme",
    surnom: "Surnom",
    villeNaissance: "Monaco",
    ref: 17,
    structureId: 1,
    datePremiereDom: null,
    typeDom: "PREMIERE_DOM",
    import: null,
    decision: {
      uuid: null,
      dateDecision: new Date("2022-05-05T07:15:36.585Z"),
      statut: "INSTRUCTION",
      userName: "Patrick Roméro",
      userId: 1,
      dateFin: new Date("2022-05-05T07:15:36.585Z"),
      dateDebut: new Date("2022-05-05T07:15:36.585Z"),
      typeDom: "PREMIERE_DOM",
    },
    historique: [
      {
        uuid: null,
        dateDecision: new Date("2022-05-05T07:15:36.585Z"),
        statut: "INSTRUCTION",
        userName: "Patrick Roméro",
        userId: 1,
        dateFin: new Date("2022-05-05T07:15:36.585Z"),
        dateDebut: new Date("2022-05-05T07:15:36.585Z"),
        typeDom: "PREMIERE_DOM",
      },
    ],
    lastInteraction: {
      dateInteraction: new Date("2022-05-05T07:15:36.585Z"),
      colisIn: 0,
      courrierIn: 0,
      recommandeIn: 0,
      enAttente: false,
    },
    docs: [],
    docsPath: [],
    etapeDemande: 1,
    rdv: null,
    notes: [],
    entretien: {},
    options: {
      npai: { actif: false, dateDebut: null },
      transfert: {
        nom: null,
        actif: false,
        adresse: null,
        dateFin: null,
        dateDebut: null,
      },
      procurations: [],
      portailUsagerEnabled: false,
    },
  },
};
// Test OK 2

// Reponse OK 2

// Test pas OK 1

// Test pas OK 2
