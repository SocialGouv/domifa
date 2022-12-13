import { UserStructureResume } from "../user-structure/UserStructureResume.type";

export type UsagerNote = {
  id: string;
  uuid: string;
  message: string;
  createdAt: Date;
  createdBy: UserStructureResume;
  archived: boolean;
  archivedAt?: Date;
  archivedBy?: UserStructureResume;
};
