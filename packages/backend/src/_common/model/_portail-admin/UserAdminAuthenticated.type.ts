import { UserAuthenticated } from "../user/UserAuthenticated.type";
import { PortailAdminUser } from "./PortailAdminUser.type";

export type UserAdminAuthenticated = UserAuthenticated<"super-admin-domifa"> & {
  user: PortailAdminUser;
};
