import { CommonUser } from "../../common-user";
import { UserSupervisorRole } from "../types";
import { type UserSupervisorDecision } from "./UserSupervisorDecision.interface";

export type UserSupervisor = CommonUser & {
  role: UserSupervisorRole;
  territories?: string[];
  decision?: UserSupervisorDecision | null;
};
