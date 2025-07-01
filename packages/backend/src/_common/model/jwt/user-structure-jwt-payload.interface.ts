import { UserStructureRole } from "@domifa/common";
import { UseBaseJwtPayload } from "./user-base-jwt-payload.type";

export type UserStructureJwtPayload = UseBaseJwtPayload<"structure"> & {
  email: string;
  id: number;
  nom: string;
  prenom: string;
  role: UserStructureRole;
  fonction: string;
  detailFonction: string;
  lastLogin: Date;
  acceptTerms: Date | null;
  structureId: number;
  domifaVersion: string;
};
