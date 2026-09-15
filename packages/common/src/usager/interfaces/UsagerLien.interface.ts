import { type UserStructureResume } from "../../users/user-structure";
import { type UsagerLienType } from "../types/UsagerLienType.type";

// Une ligne de la table usager_lien (stockage "deux lignes miroir" - voir
// UsagerLienTable.typeorm.ts).
export interface UsagerLien {
  usagerUUID: string;
  linkedUsagerUUID: string;
  type: UsagerLienType;
  structureId: number;
  createdAt?: Date;
  createdBy: UserStructureResume;
}
