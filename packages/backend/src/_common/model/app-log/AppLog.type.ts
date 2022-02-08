import { AppEntity } from "../_core";
import { LogAction } from "./LogAction.type";

export type AppLog = AppEntity & {
  userId: number;
  usagerRef?: number;
  structureId: number;
  action: LogAction;
};
