import { UseBaseJwtPayload } from "./user-base-jwt-payload.type";

export type UserUsagerJwtPayload = UseBaseJwtPayload<"usager"> & {
  userId: number;
  usagerUUID: string;
  structureId: number;
  lastLogin: Date;
};
