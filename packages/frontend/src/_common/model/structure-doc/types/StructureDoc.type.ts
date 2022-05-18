import { UserStructureCreatedBy } from "../../user-structure";
import { AppEntity } from "../../_core";
import { StructureCustomDocType } from "./StructureCustomDocType.type";

export type StructureDoc = AppEntity & {
  uuid: string;
  createdAt?: Date;
  createdBy: UserStructureCreatedBy;
  custom: boolean;
  customDocType?: StructureCustomDocType;
  displayInPortailUsager?: boolean;
  filetype: string;
  id: number | null;
  label: string;
  path?: string;
  structureId?: number;
};
