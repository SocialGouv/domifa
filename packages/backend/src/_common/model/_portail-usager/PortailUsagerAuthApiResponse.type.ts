import { PortailUsagerProfile } from "./PortailUsagerProfile.type";

export type PortailUsagerAuthApiResponse = {
  token: string;
  profile: PortailUsagerProfile;
};
