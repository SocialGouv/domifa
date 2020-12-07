import { AppEntity } from "../_core/AppEntity.type";

export type StructureCustomDocs = AppEntity & {
  createdAt?: Date;
  createdBy: string;
  tags: any;
  label: string;
  type: "custom" | "plain";
  filetype: string;
  path: string;
};
