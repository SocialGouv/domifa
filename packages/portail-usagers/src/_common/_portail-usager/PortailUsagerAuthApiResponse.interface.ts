import { PortailUsagerProfile } from "./PortailUsagerProfile.type";

export interface PortailUsagerAuthApiResponse {
  token: string;
  profile: PortailUsagerProfile;
}
