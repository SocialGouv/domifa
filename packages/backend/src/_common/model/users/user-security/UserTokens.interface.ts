import { UserTokenType } from "./UserTokenType.type";

export interface UserTokens {
  type?: UserTokenType;
  token?: string;
  validity?: Date;
}
