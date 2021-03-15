import { AppUserTokenType } from "./AppUserTokenType.type";

export type AppUserTokens = {
  type?: AppUserTokenType;
  token?: string;
  validity?: Date;
};
