import { AppEntity } from "..";
export type UsagerDoc = AppEntity & {
  createdAt: Date;
  path?: string;
  createdBy: string;
  label: string;
  filetype: string;
};
