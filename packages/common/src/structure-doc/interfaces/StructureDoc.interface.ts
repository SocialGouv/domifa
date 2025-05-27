import {
  CommonDoc,
  StructureCustomDocType,
  UserStructureCreatedBy,
} from "../..";

export interface StructureDoc extends CommonDoc {
  uuid: string;
  createdBy: UserStructureCreatedBy;
  custom: boolean;
  customDocType?: StructureCustomDocType;
  displayInPortailUsager?: boolean;
  id: number | null;
  structureId: number;
}
