import { UserRole } from "../users/user-role.type";

export interface JwtPayload {
  email: string;
  id: number;
  nom: string;
  prenom: string;
  role: UserRole;
  lastLogin: Date;
  structureId: number;
}
