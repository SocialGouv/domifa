import { PortailAdminProfile } from "./PortailAdminProfile.type";

export type PortailAdminAuthApiResponse = {
  token: string;
  profile: PortailAdminProfile;
};
