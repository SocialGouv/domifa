import { AppEntity } from "../../../_core";

export interface CommonUser extends AppEntity {
  id: number;
  uuid?: string;

  nom: string;
  prenom: string;
  email: string;
  fonction?: string | null;

  password: string;
  lastLogin: Date | null;
  passwordLastUpdate: Date;
  verified: boolean;
  acceptTerms: Date | null;

  // Frontend seulement
  access_token?: string;
  domifaVersion?: string;
}
