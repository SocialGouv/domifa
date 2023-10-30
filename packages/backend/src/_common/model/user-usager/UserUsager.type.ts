import { UserStructureResume } from "@domifa/common";
import { AppEntity } from "../_core/AppEntity.type";

export type UserUsager = AppEntity & {
  id: number;
  usagerUUID: string;
  structureId: number;
  login: string;
  password: string;
  salt: string;
  isTemporaryPassword: boolean;
  lastLogin: Date;
  passwordLastUpdate: Date;
  lastPasswordResetDate: Date;
  lastPasswordResetStructureUser: UserStructureResume;
  enabled: boolean;
};
