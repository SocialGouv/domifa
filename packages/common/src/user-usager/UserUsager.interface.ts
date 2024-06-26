import { type AppEntity } from "../_core";
import { type UserStructureResume } from "../user-structure";

export interface UserUsager extends AppEntity {
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
  acceptTerms: Date | null;
}
