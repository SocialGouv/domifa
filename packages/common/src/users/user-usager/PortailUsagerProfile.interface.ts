import { type PortailUsagerPublic } from "./PortailUsagerPublic.interface";

export interface PortailUsagerProfile {
  usager: PortailUsagerPublic;
  acceptTerms: Date | null;
  passwordLastUpdate?: Date | null;
  createdAt?: Date;
}
