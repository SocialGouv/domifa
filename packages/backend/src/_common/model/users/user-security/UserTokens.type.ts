import { UserTokenType } from "./UserTokenType.type";

export type UserTokens = {
  type?: UserTokenType;
  token?: string;
  validity?: Date;
};
