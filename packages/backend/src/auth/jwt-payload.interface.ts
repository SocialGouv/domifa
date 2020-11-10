import { UserRole } from "../_common/model";

export interface JwtPayload {
  email: string;
  id: number;
  nom: string;
  prenom: string;
  role: UserRole;
  lastLogin: Date;
  structureId: number;
}
