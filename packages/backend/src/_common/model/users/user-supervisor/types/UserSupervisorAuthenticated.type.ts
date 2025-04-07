import { UserAuthenticated } from "../../common-user/UserAuthenticated.type";
import { UserSupervisorPublic } from "./UserSupervisorPublic.type";

export type UserSupervisorAuthenticated = UserAuthenticated<"supervisor"> &
  UserSupervisorPublic;
