import { AppEntity } from "./../../_core/interfaces/AppEntity.interface";
import { createDate } from "../../_core";
import { UserStructureResume } from "../../users";
import { isWithinInterval } from "date-fns";

export class StructureInformation implements AppEntity {
  public title: string;
  public description: string;
  public startDate?: Date | null;
  public endDate?: Date | null;
  public type: "closing" | "opening-hours" | "general" | "other";
  public createdBy?: UserStructureResume;
  public structureId?: number;
  public isTemporary?: boolean;
  public isExpired?: boolean;
  public uuid?: string | undefined;
  public createdAt?: Date;
  public updatedAt?: Date;
  public version?: number;
  constructor(options?: Partial<StructureInformation>) {
    this.title = options?.title || "";
    this.description = options?.description || "";
    this.startDate = options?.startDate || null;
    this.endDate = options?.endDate || null;
    this.type = options?.type || "other";
    this.createdAt = createDate(options?.createdAt) ?? new Date();
    this.updatedAt = createDate(options?.updatedAt) ?? new Date();
    this.createdBy = options?.createdBy;
    this.structureId = options?.structureId;
    this.isTemporary = options?.isTemporary;
    this.isExpired = isMessageExpired(options);
    this.uuid = options?.uuid;
    this.version = options?.version;
  }
}

export function isMessageExpired(
  message?: Partial<StructureInformation>
): boolean | undefined {
  if (!message) return undefined;
  if (!message.endDate || !message.startDate || !message.isTemporary)
    return false;
  const today = new Date();
  return !isWithinInterval(today, {
    start: new Date(message.startDate),
    end: new Date(message.endDate),
  });
}
