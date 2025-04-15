import { UserSupervisor } from "@domifa/common";

export const USER_STRUCTURE_MOCK: UserSupervisor = {
  password: "xxx",
  uuid: "xxx",
  email: "preprod.domifa@fabrique.social.gouv.fr",
  domifaVersion: "1",
  acceptTerms: new Date(),
  id: 1,
  nom: "TEST",
  prenom: "TEST",
  lastLogin: new Date(),
  passwordLastUpdate: new Date(),
  verified: true,
  role: "super-admin-domifa",
};
