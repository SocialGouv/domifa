export interface JwtPayload {
  email: string;
  id: number;
  nom: string;
  prenom: string;
  role: string;
  lastLogin: Date;
  structureId: number;
}
