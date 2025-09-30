import { DomiciliesSegmentEnum, StructureCommon } from "@domifa/common";
import { StructureAdmin } from "../modules/admin-structures/types";

export const uneStructureAdminMock = (
  args: Partial<StructureAdmin>
): StructureAdmin => ({
  ...STRUCTURE_ADMIN_MOCK,
  ...args,
});

export const STRUCTURE_ADMIN_MOCK: StructureAdmin = {
  id: 1,
  createdAt: new Date(),
  adresse: "1 rue de l'océan",
  actifs: 10,
  usagers: 100,
  users: 5,
  uuid: "123e4567-e89b-12d3-a456-426",
  registrationDate: new Date(),
  departementLabel: "Hauts-de-Seine",
  regionLabel: "Île-de-France",
  domicilieSegment: DomiciliesSegmentEnum.SMALL,
  codePostal: "92600",
  complementAdresse: "batiment B",
  departement: "92",
  region: "11",
  email: "ccas.test@yopmail.com",
  nom: "CCAS de Test",
  verified: true,
  import: false,
  importDate: null,
  structureTypeLabel: "CCAS",
  token: "123e4567-e89b-12d3-a456-426",
  structureType: "ccas",
  ville: "Asnieres-sur-seine",
  lastLogin: new Date(),
};

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
  options: { numeroBoite: true, nomStructure: true, surnom: false },
  telephone: {
    numero: "0602030405",
    countryCode: "fr",
  },
  organismeType: null,
  acceptTerms: new Date(),
  timeZone: "Europe/Paris",
  responsable: { nom: "Jean", prenom: "Thomson", fonction: "PDG" },
  structureType: "ccas",
  ville: "Asnieres-sur-seine",
  lastLogin: new Date(),
  sms: {
    enabledByDomifa: false,
    enabledByStructure: false,
    senderDetails: "",
    senderName: "",
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
  siret: "48018776400034",
};
