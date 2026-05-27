import {
  AppEntity,
  UserStructureRole,
  UserSupervisorRole,
} from "@domifa/common";
import { LogAction } from "./LogAction.type";

export type AppLogActorType =
  | "user_structure"
  | "user_supervisor"
  | "usager"
  | "system"
  | "anonymous";

export type AppLog<T = any> = AppEntity & {
  userId?: number;
  userStructureId?: number;
  userSupervisorId?: number;
  userType?: AppLogActorType;
  usagerRef?: number;
  usagerUuid?: string;
  structureId?: number;
  action: LogAction;
  context?: T;
  scope?: string; // TODO: complete this (usager, users, etc.)
  actionLevel?: string; // TODO: complete this (delete, update, add)
  role?: UserStructureRole | UserSupervisorRole;
  createdBy?: string;
  // Display name of the actor ("prenom nom"), snapshotted at write time.
  userName?: string;
};
