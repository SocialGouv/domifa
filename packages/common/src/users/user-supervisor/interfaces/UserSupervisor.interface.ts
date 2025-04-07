import { CommonUser } from "../../common-user";
import { UserSupervisorRole } from "../types";

export type UserSupervisor = CommonUser & {
  role: UserSupervisorRole;
  territories?: string[];
};
