import { AppEntity } from "@domifa/common";
import { StructureCustomDocType } from ".";
import { UserStructureCreatedBy } from "../user-structure/UserStructureCreatedBy.type";

export type StructureDoc = AppEntity & {
  uuid: string;
  createdAt?: Date;
  createdBy: UserStructureCreatedBy;
  custom: boolean;
  customDocType?: StructureCustomDocType;
  displayInPortailUsager?: boolean;
  filetype: string;
  id?: number;
  label: string;
  path: string;
  structureId: number;
};
