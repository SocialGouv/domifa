import { UserStructureTokenType } from "./UserStructureTokenType.type";

export type UserStructureTokens = {
  type?: UserStructureTokenType;
  token?: string;
  validity?: Date;
};
