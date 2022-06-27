import { AppEntity } from "../_core";

export type UsagerDoc = AppEntity & {
  createdAt?: Date;
  createdBy: string;
  label: string;
  filetype: string;
  path: string;
};
