import { type AppEntity } from "../../_core";
import { type UserStructureResume } from "../user-structure";
import { PasswordType } from "./PasswordType.type";

export interface UserUsager extends AppEntity {
  id: number;
  usagerUUID: string;
  structureId: number;
  login: string;
  password: string;
  salt: string;
  lastLogin: Date;
  passwordLastUpdate: Date;
  lastPasswordResetDate: Date;
  lastPasswordResetStructureUser: UserStructureResume;
  acceptTerms: Date | null;
  passwordType: PasswordType;
}
