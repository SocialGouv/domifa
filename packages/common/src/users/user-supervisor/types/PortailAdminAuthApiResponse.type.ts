import { PortailAdminUser } from "./PortailAdminUser.type";

export type PortailAdminAuthApiResponse = {
  token: string;
  user: PortailAdminUser;
};
