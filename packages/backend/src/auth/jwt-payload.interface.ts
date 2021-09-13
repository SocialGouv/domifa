import { UserStructureRole } from "../_common/model";

export interface JwtPayload {
  email: string;
  id: number;
  nom: string;
  prenom: string;
  role: UserStructureRole;
  lastLogin: Date;
  structureId: number;
}
