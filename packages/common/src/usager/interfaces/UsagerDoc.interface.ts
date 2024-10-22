import { type AppEntity } from "../../_core";

export interface UsagerDoc extends AppEntity {
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
  shared: boolean;
}
