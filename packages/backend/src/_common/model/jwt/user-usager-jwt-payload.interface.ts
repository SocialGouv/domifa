import { UseBaseJwtPayload } from "./user-base-jwt-payload.type";

export type UserUsagerJwtPayload = UseBaseJwtPayload<"usager"> & {
  usagerUUID: string;
  structureId: number;
};
