import { AppUserCreatedBy } from "../app-user/AppUserCreatedBy.type";
import { AppEntity } from "../_core/AppEntity.type";

export type StructureDoc = AppEntity & {
  createdAt?: Date;
  createdBy: AppUserCreatedBy;
  tags: any;
  label: string;
  custom: boolean;
  filetype: string;
  path: string;
  structureId: number;
  id?: number;
  loadingDelete: boolean;
  loadingDownload: boolean;
};
