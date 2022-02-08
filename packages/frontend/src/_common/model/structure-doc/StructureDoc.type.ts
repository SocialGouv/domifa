import { StructureCustomDocType } from ".";
import { UserStructureCreatedBy } from "../user-structure/UserStructureCreatedBy.type";
import { AppEntity } from "../_core/AppEntity.type";

export type StructureDoc = AppEntity & {
  uuid?: string;
  createdAt?: Date;
  createdBy: UserStructureCreatedBy;
  custom: boolean;
  customDocType?: StructureCustomDocType;
  displayInPortailUsager?: boolean;
  filetype: string;
  id?: number;
  label: string;
  path?: string;
  structureId: number;
};
