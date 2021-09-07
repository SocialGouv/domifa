import { AppUserResume } from "../app-user/AppUserResume.type";

export type UsagerNote = {
  id: string;
  message: string;
  createdAt: Date;
  createdBy: AppUserResume;
  archived: boolean;
  archivedAt?: Date;
  archivedBy?: AppUserResume;
};
