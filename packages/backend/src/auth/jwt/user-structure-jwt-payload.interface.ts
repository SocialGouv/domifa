import { UserStructureRole } from "../../_common/model";
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
