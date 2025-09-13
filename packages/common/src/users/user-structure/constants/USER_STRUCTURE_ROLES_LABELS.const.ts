import { UserStructureRole } from "../types";

export const USER_STRUCTURE_ROLES_LABELS: {
  [key in UserStructureRole]: string;
} = {
  admin: "Administrateur",
  responsable: "Gestionnaire",
  simple: "Instructeur",
  facteur: "Facteur",
  agent: "Agent d'accueil",
};
