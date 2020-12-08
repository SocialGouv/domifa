import { AppUserCreatedBy } from "../app-user";
import { AppEntity } from "../_core/AppEntity.type";

export type StructureDoc = AppEntity & {
  createdAt?: Date;
  createdBy: AppUserCreatedBy;
  tags: any;
  id?: number;
  label: string;
  custom: boolean;
  filetype: string;
  path: string;
  structureId: number;
};
