import { AppEntity } from "./AppEntity.interface";

export interface CommonDoc extends AppEntity {
  createdAt?: Date;
  label: string;
  filetype: string;
  path: string;
  structureId: number;
  encryptionContext?: string;
  encryptionVersion?: number;
}
