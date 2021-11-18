import { StructureCustomDocType } from ".";
import { UserStructureCreatedBy } from "../user-structure/UserStructureCreatedBy.type";
import { AppEntity } from "../_core/AppEntity.type";

export type StructureDoc = AppEntity & {
  createdBy: UserStructureCreatedBy;
  tags: any;
  label: string;
  custom: boolean;
  customDocType?: StructureCustomDocType;
  displayInPortailUsager: boolean;
  filetype: string;
  path: string;
  structureId: number;
  id?: number;
};
