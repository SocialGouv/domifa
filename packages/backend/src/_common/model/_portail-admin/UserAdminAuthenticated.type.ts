import { PortailAdminUser } from "@domifa/common";
import { UserAuthenticated } from "../users";

export type UserAdminAuthenticated = UserAuthenticated<"supervisor"> &
  PortailAdminUser;
