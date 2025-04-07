import { type PortailUsagerProfile } from "./PortailUsagerProfile.interface";

export interface PortailUsagerAuthApiResponse {
  token: string;
  acceptTerms: Date | null;
  profile: PortailUsagerProfile;
}
