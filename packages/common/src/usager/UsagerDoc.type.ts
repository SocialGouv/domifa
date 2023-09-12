import { AppEntity } from "../_core";

export type UsagerDoc = AppEntity & {
  createdAt?: Date;
  createdBy: string;
  label: string;
  filetype: string;
  usagerUUID: string;
  path: string;
  structureId: number;
  usagerRef: number;
  encryptionContext?: string;
  encryptionVersion?: number;
};
