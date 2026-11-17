import { type UserStructureResume } from "../../users/user-structure";
import { type UsagerLienType } from "../types/UsagerLienType.type";

// A row of the usager_lien table ("mirrored rows" storage — see
// UsagerLienTable.typeorm.ts).
export interface UsagerLien {
  usagerUUID: string;
  linkedUsagerUUID: string;
  type: UsagerLienType;
  structureId: number;
  createdAt?: Date;
  createdBy: UserStructureResume;
}
