import { StructureInformation } from "./../interfaces/StructureInformation.interface";
import { createDate } from "../../_core";
import { UserStructureResume } from "../../users";
import { isWithinInterval } from "date-fns";

export class StructureInformationMessage implements StructureInformation {
  public title: string;
  public description: string;
  public startDate: Date;
  public endDate: Date | null;
  public type: "closing" | "opening-hours" | "general" | "other";
  public createdBy: UserStructureResume;
  public structureId: number;
  public isTemporary: boolean;
  public isExpired: boolean;
  public uuid?: string | undefined;
  public createdAt?: Date;
  public updatedAt?: Date;
  public version?: number;
  constructor(options: StructureInformation) {
    this.title = options.title;
    this.description = options.description;
    this.startDate = options.startDate;
    this.endDate = options.endDate;
    this.type = options.type;
    this.createdAt = createDate(options.createdAt) ?? undefined;
    this.updatedAt = createDate(options.updatedAt) ?? undefined;
    this.createdBy = options.createdBy;
    this.structureId = options.structureId;
    this.isTemporary = options.isTemporary;
    this.isExpired = this.isMessageExpired();
    this.uuid = options.uuid;
    this.version = options.version;
  }

  public isMessageExpired(): boolean {
    if (!this.endDate || !this.startDate || !this.isTemporary) return false;
    const today = new Date();
    return !isWithinInterval(today, {
      start: new Date(this.startDate),
      end: new Date(this.endDate),
    });
  }
}
