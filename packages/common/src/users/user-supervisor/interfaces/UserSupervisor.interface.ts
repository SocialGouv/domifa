import { CommonUser } from "../../common-user";
import { UserSupervisorRole } from "../types";

export type UserSupervisor = Omit<CommonUser, "fonction"> & {
  role: UserSupervisorRole;
  territories?: string[];
  fonction: string;
};
