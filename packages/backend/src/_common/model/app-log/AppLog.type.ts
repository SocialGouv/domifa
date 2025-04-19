import { UserStructureRole, UserSupervisorRole } from "@domifa/common";
import { AppEntity } from "../_core";
import { LogAction } from "./LogAction.type";

export type AppLog = AppEntity & {
  userId: number;
  usagerRef?: number;
  structureId?: number;
  action: LogAction;
  role?: UserStructureRole | UserSupervisorRole;
  createdBy?: string;
};
