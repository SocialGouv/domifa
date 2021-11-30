import { UserStructureRole } from "../user-structure/UserStructureRole.type";
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
  structureId: number;
};
