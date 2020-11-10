import { AppEntity } from "../../database/AppEntity.model";
import { UserRole } from "../user-role.type";
import { AppUserMails } from "./AppUserMails.type";
import { AppUserTokens } from "./AppUserTokens.type";

export type AppUser = AppEntity & {
  //  public _id: ObjectID;
  /**
   * @deprecated obsolete mongo id: use `uuid` instead.
   */
  _id?: any;

  id: number;

  prenom: string;
  nom: string;
  fonction?: string;
  structureId: number;

  // login tokens
  email: string;
  password: string;

  lastLogin: Date;
  passwordLastUpdate: Date;

  verified: boolean;

  role: UserRole; // security profile

  mail: AppUserMails;
  temporaryTokens: AppUserTokens; // used on creation & reset password
};
