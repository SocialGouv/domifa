import { UserStructureCreatedBy } from "@domifa/common";
import { StructureCustomDocType } from ".";
import { AppEntity } from "../_core/AppEntity.type";

export type StructureDoc = AppEntity & {
  createdBy: UserStructureCreatedBy;
  label: string;
  custom: boolean;
  customDocType?: StructureCustomDocType;
  displayInPortailUsager: boolean;
  filetype: string;
  path: string;
  structureId: number;
  id?: number;
};
