import { UsagerPublic } from "../usager";

export type AuthApiResponse = {
  token: string;
  authUsager: UsagerPublic;
};
