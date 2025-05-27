import { AppEntity } from "../../_core";

export interface UserUsagerLogin extends AppEntity {
  usagerUUID: string;
  structureId: number;
}
