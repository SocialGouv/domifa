import { AppEntity, UserStructureResume } from "@domifa/common";

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
