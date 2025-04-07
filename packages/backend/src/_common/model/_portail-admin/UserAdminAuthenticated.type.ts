import { UserAuthenticated } from "../users/common-user/UserAuthenticated.type";
import { PortailAdminUser } from "./PortailAdminUser.type";

export type UserAdminAuthenticated = UserAuthenticated<"supervisor"> &
  PortailAdminUser;
