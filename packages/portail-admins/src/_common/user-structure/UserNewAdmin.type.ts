import { AdminStructuresListStructureModel } from "src/app/modules/admin-structures/components/admin-structures-list/model";

export type UserNewAdmin = {
  prenom: string;
  nom: string;
  email: string;
  structureId?: Number;
  structure?: AdminStructuresListStructureModel;
  role: "admin";
};
