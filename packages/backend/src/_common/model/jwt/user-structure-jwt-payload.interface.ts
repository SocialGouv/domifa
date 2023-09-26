import { UserStructureRole } from "@domifa/common";
import { UseBaseJwtPayload } from "./user-base-jwt-payload.type";

export type UserStructureJwtPayload = UseBaseJwtPayload<
  "structure" | "super-admin-domifa"
> & {
  email: string;
  id: number;
  nom: string;
  prenom: string;
  role: UserStructureRole;
  lastLogin: Date;
  acceptTerms: Date | null;
  structureId: number;
  domifaVersion: string;
};
