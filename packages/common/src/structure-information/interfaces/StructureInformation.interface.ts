import { AppEntity } from "../../_core";
import { UserStructureResume } from "../../user-structure";

export interface StructureInformation extends AppEntity {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  type: "closing" | "opening-hours" | "general" | "other";
  createdBy: UserStructureResume;
  structureId: number;
  isTemporary: boolean;
}
