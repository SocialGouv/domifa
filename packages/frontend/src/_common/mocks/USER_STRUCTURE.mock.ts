import { UserStructure, UserStructureRole } from "@domifa/common";
import { STRUCTURE_MOCK } from "./STRUCTURE_MOCK.const";

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
  structure: { ...STRUCTURE_MOCK },
  structureId: 100,
};
