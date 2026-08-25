import { UserTokenType } from "./UserTokenType.type";

export interface UserTokens {
  type?: UserTokenType;
  token?: string;
  validity?: Date;
  // "email-change" only: the address to apply once the token is confirmed.
  // The token alone doesn't carry it, so we need it alongside.
  newEmail?: string;
}
