import { UserStructureResume } from "../user-structure/UserStructureResume.type";

export type UsagerNote = {
  id: number;
  uuid?: string;
  message: string;
  usagerUUID: string;
  structureId: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: UserStructureResume;
  archived: boolean;
  archivedAt?: Date;
  archivedBy?: UserStructureResume;
};
