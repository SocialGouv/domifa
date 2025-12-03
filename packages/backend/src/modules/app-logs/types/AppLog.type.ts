import {
  AppEntity,
  UserStructureRole,
  UserSupervisorRole,
} from "@domifa/common";
import { LogAction } from "./LogAction.type";

export type AppLog<T = any> = AppEntity & {
  userId?: number;
  usagerRef?: number;
  structureId?: number;
  action: LogAction;
  context?: T;
  scope?: string; // TODO: complete this (usager, users, etc.)
  actionLevel?: string; // TODO: complete this (delete, update, add)
  role?: UserStructureRole | UserSupervisorRole;
  createdBy?: string;
};
